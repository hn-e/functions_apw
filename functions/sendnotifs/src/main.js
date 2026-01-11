import { sendNotification } from "./handlers/sendNotification.js";
import { partyFetch } from "./handlers/partyFetch.js";

export default async ({ req, res, log, error }) => {
  try {
    const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {}; 
    const action = data.__action;

    log(`[ENTRY] action=${action}`);

    let result;

    switch (action) {
      case "__send_notification":
        result = await sendNotification({ data, log });
        break;

      case "__party_fetch":
        result = await partyFetch({ data, log });
        break;

      default:
        log("[EVENT] No __action found, defaulting to notification");
        result = await sendNotification({ data, log });
        break;
    }

    return res.json({ success: true, action, result });

  } catch (err) {
    error(err);
    return res.json({ success: false, error: err.message });
  }
};
