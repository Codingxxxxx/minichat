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

/**
 * create s3 object url
 * @param {string} userId 
 * @param {string} fileUrl 
 * @returns {string} url of object 
 */
function createAvatarUrl(userId, fileUrl) {
  return `${AppConfig.S3_URL}/user/avatar/${userId}/${fileUrl}`;
}

/**
 * create random avatar url host by https://www.dicebear.com
 * @param {string} username 
 * @returns {string}
 */
function createRandomAvatarUrl(username) {
  return `${AppConfig.RANDOM_AVATAR_URL}?seed=${username}`;
}

module.exports = {
  client: s3Client,
  createAvatarUrl,
  createRandomAvatarUrl
};