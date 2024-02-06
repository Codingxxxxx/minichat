const { pbkdf2, randomBytes } = require('crypto');
const { AppConfig } = require('../const');
const { sign, verify } = require('jsonwebtoken');

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

/**
 * Encode payload to jwt format
 * @param {Object} payload
 * @returns {Promise<string>}
 */
function signJWT(payload) {
  return new Promise((resolve, reject) => {
    sign(payload, AppConfig.JWT_SECRET, {
      expiresIn: '15m',
      subject: payload.username,
      issuer: 'www.easychat.com'
    }, (err, encodedString) => {
      if (err) return reject(err);
      resolve(encodedString);
    })
  })
}

/**
 * Get payload from jwt token
 * @param {string} token 
 * @param {boolean} ignoreExpiration
 * @returns {Promise<string>}
 */
function decodeJWT(token, ignoreExpiration=false) {
  return new Promise((resolve, reject) => {
    verify(token, AppConfig.JWT_SECRET, { ignoreExpiration: ignoreExpiration }, (error, payload) => {
      if (error) return reject(error);
      resolve(payload);
    })
  })
}

/**
 * Sign refresh token, expire in 30 days
 * @param {Object | null} payload 
 * @returns {Promise<string>}
 */
function signRefreshToken(payload={}) {
  return new Promise((resolve, reject) => {
    sign(payload, AppConfig.JWT_REFRESH_SECRET, { expiresIn: '30 days' }, (error, token) => {
      if (error) return reject(error);
      resolve(token);
    })
  })
}

/**
 * Decode refresh token
 * @param {Object} token 
 * @returns {Promise<string>}
 */
function decodeRefreshToken(token) {
  return new Promise((resolve, reject) => {
    verify(token, AppConfig.JWT_REFRESH_SECRET, (error, payload) => {
      if (error) return reject(error);
      resolve(payload)
    })
  })
}

module.exports = {
  hashPassword,
  createRandomToken,
  decodeJWT,
  signJWT,
  signRefreshToken,
  decodeRefreshToken
}