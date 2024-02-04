const { pbkdf2, randomBytes } = require('crypto');
const { AppConfig } = require('../const');

/**
 * Hash password using pbkdf2, if salt is not provided, it will be auto generated
 * @param {string} plainPassword 
 * @param {string} [salt] 
 * @returns {Array<string, string>}
 */
async function hashPassword(plainPassword, salt) {
  if (!salt) {
    salt = await new Promise((resolve, reject) => {
      randomBytes(256, (error, bytes) => {
        if (error) return reject(error);
        resolve(bytes);
      })
    })
  } else {
    salt = Buffer.from(salt, 'base64');
  }

  const key = await new Promise((resolve, reject) => {
    pbkdf2(Buffer.from(plainPassword), salt, Number(AppConfig.PBKDF2_ITERATION), Number(AppConfig.PBKDF2_KEYLEN), AppConfig.PBKDF2_DIGEST, (error, key) => {
      if (error) return reject(error);
      resolve(key.toString('base64'))
    })
  })

  return [key, salt.toString('base64')]
}

/**
 * Create a string of random character with base64 format
 * @returns {Promise<string>}
 */
function createRandomToken() {
  return new Promise((resolve, reject) => {
    randomBytes(64, (error, buf) => {
      if (error) return reject(error);
      resolve(buf.toString('base64url'))
    })
  })
}

module.exports = {
  hashPassword,
  createRandomToken
}