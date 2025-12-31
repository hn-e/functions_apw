import AWS from "aws-sdk";

export default async ({ req, res, log }) => {
  try {
    log("Function started");
    const data = req.body ? JSON.parse(req.body) : {};
    log("Received data:", data);
    const { name, type, base64 } = data;

    if (!name || !base64) {
      log("No file provided");
      return res.json({ error: "No file provided" });
    }

    const s3 = new AWS.S3({
    //   endpoint: process.env.R2_ENDPOINT,      // e.g., https://<account>.r2.cloudflarestorage.com
    //   accessKeyId: process.env.R2_KEY,
    //   secretAccessKey: process.env.R2_SECRET,
      endpoint: 'https://0d1c7b3acd3ae12efb5b7027d4750332.r2.cloudflarestorage.com',      // e.g., https://<account>.r2.cloudflarestorage.com
      accessKeyId: '016a1c9498c63716ddd460b3bf143636',
      secretAccessKey: '69c665f3aeae5ec144620d3087e525f9e31ab11407a0d1c18319ff7ed69d60bf',
      region: "auto",
      signatureVersion: "v4",
    });

    const buffer = Buffer.from(base64, "base64");

    log("Uploading file to R2:", name);
    await s3
      .putObject({
        Bucket: 'userbase',
        Key: name,
        Body: buffer,
        ContentType: type,
      })
      .promise();

    const fileUrl = `https://pub-bf39ce353cf24eae9273de931ddda57e.r2.dev/${name}`;
    log("Upload successful. File URL:", fileUrl);

    return res.json({ ok: true, url: fileUrl });
  } catch (err) {
    log("Error:", err);
    return res.json({ error: err.message });
  }
};
