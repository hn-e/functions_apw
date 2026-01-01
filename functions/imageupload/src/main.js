import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async ({ req, res, log }) => {
  try {
    const data = req.body ? JSON.parse(req.body) : {};
    const { name, type, storageFolder } = data;

    if (!name || !type) {
      return res.json({ error: "Missing name or type" });
    }

    const client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESSKEY,
        secretAccessKey: process.env.R2_SECRETKEY,
      },
    });

    const key = `${storageFolder}/${Date.now()}-${name}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_EXTROBASE,
      Key: key,
      ContentType: type,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: 300,
    });

    const publicUrl = `${process.env.R2_PUBLICURL_EXTROBASE}/${key}`;

    return res.json({ uploadUrl, publicUrl });
  } catch (err) {
    log(err);
    return res.json({ error: err.message });
  }
};
