import fetch from "node-fetch";
import { getRandom } from "./random.js";

export async function sendPush({ token, title, message, titles, messages, log, }) {
  if (!token) return;

  const finalTitle = title || getRandom(titles);
  const finalMsg = message || getRandom(messages);

  log?.(`[PUSH] → ${token}`);

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: token,
      sound: "default",
      title: finalTitle,
      body: finalMsg,
    }),
  });
}
