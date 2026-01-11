import { Query } from "node-appwrite";
import { sendPush } from "../utils/push.js";
import { getDb } from "../utils/appwrite.js";

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

export async function sendNotification({ data, log }) {
  const { __title: title, __msg: msg, __tokens: tokens } = data;
  const db = getDb(process.env.APPWRITE_SENDNOTIF_APIKEY);

  let allTokens = [];

  if (Array.isArray(tokens) && tokens.length) {
    log("[NOTIF] Using custom tokens");
    allTokens = tokens.filter(Boolean);
  } else {
    log("[NOTIF] Fetching all users");

    let offset = 0;
    const limit = 500;
    let more = true;

    while (more) {
      const users = await db.listDocuments(
        process.env.APPWRITE_DATABASEID,
        process.env.APPWRITE_USER_COLLECTIONID,
        [Query.limit(limit), Query.offset(offset)]
      );

      allTokens.push(
        ...users.documents.map(d => d.pushtoken).filter(Boolean)
      );

      offset += limit;
      more = offset < users.total;
    }
  }

  log(`[NOTIF] Total tokens: ${allTokens.length}`);

  for (let i = 0; i < allTokens.length; i += 100) {
    const batch = allTokens.slice(i, i + 100);
    await Promise.all(
      batch.map(token =>
        sendPush({ token, title, message: msg, titles, messages: msgs, log, })
      )
    );
  }

  return { sent: allTokens.length };
}
