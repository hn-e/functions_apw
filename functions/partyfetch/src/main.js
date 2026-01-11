import { Client, Databases, Query } from "node-appwrite";
import fetch from 'node-fetch';

const titles = [
  "🎉 Your event is being noticed!",
  "🕺 People are interested in your hangout!",
  "🔥 Your party is attracting attention!",
  "🚨 New interest in your event!",
  "🎶 Folks are checking out your party!",
  "🌟 Your hangout is gaining popularity!",
  "💥 Your event is the talk of the town!",
  "🚀 Your party is taking off!",
];

const msgs = [
  "People are noticing your party!",
  "Your hangout is getting attention!",
  "More folks want to join your event!",
  "Your party is attracting interest!",
  "Your hangout is the place to be!",
  "People are excited about your event!",
  "Your party is gaining momentum!",
  "Your hangout is the buzz of the town!",
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

    const partyid = data.partyId;

    const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECTID)
    .setKey(process.env.APPWRITE_PARTYFETCH_APIKEY);

    const databases = new Databases(client);

    const party = await databases.getDocument(
      process.env.APPWRITE_DATABASEID,
      process.env.APPWRITE_PARTY_COLLECTIONID,
      partyid
    );

    if (Math.random() < 0.1) {
      commonPushUtil(party.creator.pushtoken);
    }

    return res.json({
      title: party.title,
      thumbnail: party.thumbnail,
      location: party.location,
      cityId: party.cityId,
      type: party.type,
      creatorname: party.creator.name,
      date: party.date,
      description: party.description,
      headcount: party.headcount,
      superLats: party.superLats,
      preferences: party.preferences,
    });

  } catch (err) {
    error(err);
    return res.json({ error: err.message, details: err });
  }
};
