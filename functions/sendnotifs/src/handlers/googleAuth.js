import { Client, Users, Query, ID } from "node-appwrite";
import { OAuth2Client } from "google-auth-library";

export async function googleAuth({ data, log }) {
  const { idToken } = data;
  
  if (!idToken) {
    throw new Error("Missing idToken in request");
  }

  const clientId = process.env.GOOGLE_WEB_CLIENT_ID;
  if (!clientId) {
    throw new Error("Server configuration error: Missing GOOGLE_WEB_CLIENT_ID");
  }

  log("[GOOGLE_AUTH] Verifying token");
  const authClient = new OAuth2Client(clientId);
  
  const ticket = await authClient.verifyIdToken({
    idToken,
    audience: clientId,
  });
  
  const payload = ticket.getPayload();
  const { email, name } = payload;
  
  if (!email) {
    throw new Error("Google token did not contain an email address");
  }

  log(`[GOOGLE_AUTH] Token verified for email: ${email}`);

  // Initialize Appwrite
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECTID || process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const users = new Users(client);
  
  let userId;
  
  log("[GOOGLE_AUTH] Searching for existing user");
  const userList = await users.list([Query.equal('email', [email])]);
  
  if (userList.total > 0) {
    userId = userList.users[0].$id;
    log(`[GOOGLE_AUTH] Found existing user: ${userId}`);
  } else {
    log("[GOOGLE_AUTH] Creating new user");
    // Password must be 8-32 chars. Generating a random one.
    const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + "Aa1!";
    const newUser = await users.create(ID.unique(), email, undefined, randomPassword, name);
    userId = newUser.$id;
    log(`[GOOGLE_AUTH] Created new user: ${userId}`);
  }

  log("[GOOGLE_AUTH] Generating Appwrite session token");
  const token = await users.createToken(userId);

  return {
    userId: userId,
    secret: token.secret,
  };
}

