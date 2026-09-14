import fetch, { Headers, Request, Response, Blob, File, FormData } from "node-fetch";

// 1. The Polyfill MUST run before any of the handlers are imported/evaluated
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
  globalThis.Blob = Blob;
  globalThis.File = File;
  globalThis.FormData = FormData;
}

export default async ({ req, res, log, error }) => {
  try {
    const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {}; 
    const action = data.__action;

    log(`[ENTRY] action=${action}`);

    let result;

    switch (action) {
      case "__send_notification": {
        // 2. Dynamic imports ensure that the polyfill above has already completed
        // BEFORE the packages inside these handlers try to capture global properties!
        const { sendNotification } = await import("./handlers/sendNotification.js");
        result = await sendNotification({ data, log });
        break;
      }
      case "__party_fetch": {
        const { partyFetch } = await import("./handlers/partyFetch.js");
        result = await partyFetch({ data, log });
        break;
      }
      case "__google_auth": {
        const { googleAuth } = await import("./handlers/googleAuth.js");
        result = await googleAuth({ data, log });
        break;
      }
      case "__apple_auth": {
        const { appleAuth } = await import("./handlers/appleAuth.js");
        result = await appleAuth({ data, log });
        break;
      }
      default: {
        log("[EVENT] No __action found, defaulting to notification");
        const { sendNotification } = await import("./handlers/sendNotification.js");
        result = await sendNotification({ data, log });
        break;
      }
    }

    return res.json({ success: true, action, result });

  } catch (err) {
    error(err);
    return res.json({ success: false, error: err.message });
  }
};
