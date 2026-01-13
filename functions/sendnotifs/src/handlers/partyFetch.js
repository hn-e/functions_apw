import { sendPush } from "../utils/push.js";
import { getDb } from "../utils/appwrite.js";

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

export async function partyFetch({ data, log }) {
  const { partyId } = data;
  const db = getDb(process.env.APPWRITE_PARTYFETCH_APIKEY);

  log(`[PARTY] Fetching party ${partyId}`);

  const party = await db.getDocument(
    process.env.APPWRITE_DATABASEID,
    process.env.APPWRITE_PARTY_COLLECTIONID,
    partyId
  );

  if (Math.random() < 0.1) {
    log("[PARTY] Triggering creator push");
    await sendPush({
      token: party.creator?.pushtoken,
      titles,
      messages: msgs,
      log,
    });
  }

  return {
    title: party.title,
    thumbnail: party.thumbnail,
    location: party.location,
    cityId: party.cityId,
    type: party.type,
    creatorname: party.creator.name,
    date: party.date,
    time: party.time,
    description: party.description,
    headcount: party.headcount,
    superLats: party.superLats,
    preferences: party.preferences,
  };
}
