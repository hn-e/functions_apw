import { Client, Databases, Query } from "node-appwrite";
import fetch from 'node-fetch';

const titles = [
  "🎉 The Party Plan is here!",
  "🕺 New Hangout Alert!",
  "🔥 Party Created Near You!",
  "🚨 New Event Just Dropped!",
  "🎶 People Are Partying!",
  "🌟 Hangout Starts Now!",
  "🥳 Fun is Waiting for You!",
  "💥 New hangout in Your City!",
  "🚀 Get Ready to Party!",
  "🌈 New Event, New Vibes!",
  "🎉Its happening! Join the Fun!",
  "🎈 The Ultimate Hangout is Here!",
  "🌍 Local Party Alert!",
  "🏙 Something Big is Planned!",
  "💃 The Hottest Hangout Near You!"
];

const msgs = [
  "Join before it fills up!",
  "RSVP now, spots are limited!",
  "Don’t miss out! Grab your spot!",
  "Hurry, the fun’s waiting!",
  "Join the party before it’s full!",
  "Get in on the action now!",
  "Don’t wait! RSVP now!",
  "Spots filling fast! Join now!",
  "Hurry, time’s running out!",
  "Be part of the fun—join now!",
  "Get in quick before it’s gone!",
  "RSVP before it’s too late!",
  "Join the party while you can!",
  "This event’s heating up! Join fast!",
  "Spots are going fast! Don’t miss it!"
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function commonPushUtil(toPushToken, title, msg) {
  if (!toPushToken) return;

  const pushTitle = title || getRandomElement(titles);
  const pushMsg = msg || getRandomElement(msgs);

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: toPushToken,
      sound: "default",
      title: pushTitle,
      body: pushMsg
    })
  });
}

export default async ({ req, res, log, error }) => {
  try {
    let data = {};
    try {
      data = req.body ? JSON.parse(req.body) : {};
    } catch (e) {
      log("Invalid JSON body");
    }

    const customTitle = data.title;
    const customMsg = data.msg;

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
      log(batch);
      await Promise.all(batch.map(token =>
        commonPushUtil(token, customTitle, customMsg)
      ));
    }

    return res.json({ sent: allTokens.length, customTitle, customMsg });

  } catch (err) {
    error(err);
    return res.json({ error: err.message, details: err });
  }
};
