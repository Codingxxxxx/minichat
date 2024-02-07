const { S3Client } = require("@aws-sdk/client-s3");
const { AppConfig } = require("../const");

// Create S3 client
const s3Client = new S3Client({
  region: AppConfig.S3_REGION,
  credentials: {
    accessKeyId: AppConfig.S3_ACCESS_KEY_ID,
    secretAccessKey: AppConfig.S3_SECRET_ACCESS_KEY
  }
});

module.exports = s3Client;