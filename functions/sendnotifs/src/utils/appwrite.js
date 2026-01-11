import { Client, Databases } from "node-appwrite";

export function getDb(apiKey) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECTID)
    .setKey(apiKey);

  return new Databases(client);
}
