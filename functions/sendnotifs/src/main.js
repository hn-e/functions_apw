import { Client, Databases, Query } from "node-appwrite";
import fetch from 'node-fetch';

async function commonPushUtil(toPushToken, title, msg) {
  if (!toPushToken) return;
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: toPushToken,
      sound: "default",
      title,
      body: msg
    })
  });
}

export default async ({ req, res }) => {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECTID)
      .setKey(process.env.APPWRITE_SENDNOTIF_APIKEY);

    const databases = new Databases(client);

    const pageSize = 500;  // fetch 500 users at a time
    let offset = 0;
    let more = true;
    let allTokens = [];

    while (more) {
      const users = await databases.listDocuments(
        process.env.APPWRITE_DATABASEID,
        process.env.APPWRITE_USER_COLLECTIONID,
        [ Query.limit(pageSize), Query.offset(offset) ]
      );

      const tokens = users.documents.map(doc => doc.pushtoken).filter(Boolean);
      allTokens.push(...tokens);

      offset += pageSize;
      more = users.total > offset;
    }

    // send in batches of 100 (Expo limit)
    const batchSize = 100;
    for (let i = 0; i < allTokens.length; i += batchSize) {
      const batch = allTokens.slice(i, i + batchSize);
      // console.log(batch);
      // console.log('==========');
      await Promise.all(batch.map(token => commonPushUtil(token, "Hello", "Your message")));
    }

    return res.json({ sent: allTokens.length });

  } catch (err) {
    return res.json({ error: err.message, details: err });
  }
};
