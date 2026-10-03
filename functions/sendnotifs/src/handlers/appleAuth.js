import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { Client, Users, Query, ID } from "node-appwrite";

const client = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys"
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    if (err) {
      callback(err, null);
      return;
    }
    const signingKey = key.publicKey || key.getPublicKey();
    callback(null, signingKey);
  });
}

const verifyAppleToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      algorithms: ["RS256"],
      audience: "com.pro.nubpack",
      issuer: "https://appleid.apple.com"
    }, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

export async function appleAuth({ data, log }) {
  const { identityToken, emailFallback } = data;
  
  if (!identityToken) {
    throw new Error("Missing identityToken in request");
  }

  log("[APPLE_AUTH] Verifying token");
  const decoded = await verifyAppleToken(identityToken);
  
  let email = decoded.email || emailFallback;
  
  if (!email) {
    log("[APPLE_AUTH] No email found in token or fallback. Generating placeholder.");
    const appleUserId = decoded.sub; // Apple's unique subject ID for the user
    email = `apple_${appleUserId}@extroverts.app`;
  }

  log(`[APPLE_AUTH] Token verified for email: ${email}`);

  // Initialize Appwrite
  const appwriteClient = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECTID || process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const users = new Users(appwriteClient);
  
  let userId;
  
  log("[APPLE_AUTH] Searching for existing user");
  const userList = await users.list([Query.equal("email", [email])]);
  
  if (userList.total > 0) {
    userId = userList.users[0].$id;
    log(`[APPLE_AUTH] Found existing user: ${userId}`);
  } else {
    log("[APPLE_AUTH] Creating new user");
    // Password must be 8-32 chars. Generating a random one.
    const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + "Aa1!";
    const newUser = await users.create(ID.unique(), email, undefined, randomPassword, undefined);
    userId = newUser.$id;
    log(`[APPLE_AUTH] Created new user: ${userId}`);
  }

  log("[APPLE_AUTH] Generating Appwrite session token");
  const token = await users.createToken(userId);

  return {
    userId: userId,
    secret: token.secret,
    email: email,
  };
}

