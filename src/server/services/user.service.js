const { UserModel, UserVerificationModel } = require('../models');

/**
 * Create a user
 * @param {Object} user
 * @param {string} user.username
 * @param {string} user.password
 * @param {string} user.salt
 * @param {string} user.email
 * @param {string} user.displayName
 * @returns {object}
 */
function create({ username, password, salt, email }) {
  return UserModel.create({
    username,
    password,
    salt,
    email
  })
}

/**
 * Get a user by username
 * @param {string} username 
 */
function getUserByUsername(username) {
  return UserModel
    .findOne({
      username: {
        $regex: new RegExp(username.trim(), 'i')
      }
    })
    .lean()
}

/**
 * Get user by verification token
 * @param {string} token 
 * @returns {Object}
 */
function getUserByToken(token) {
  return UserVerificationModel
    .findOne({
      token
    })
    .lean()
}

/**
 * 
 * @param {Object} userVerification
 * @param {string} userVerification.userId
 * @param {string} userVerification.token
 * @param {string} userVerification.expirationDate 
 * @returns {Promise<any>}
 */
function createUserVerificationToken({ userId, token, expirationDate }) {
  return UserVerificationModel.create({
    userId,
    token,
    expirationDate
  })
}

/**
 * Set if user is verified or not
 * @param {string} userId 
 * @param {boolean} status 
 * @returns {Promise<object>}
 */
function setUserIsVerified(userId, status) {
  return UserModel
    .findOneAndUpdate({ _id: userId }, {
      isVerified: status
    })
    .lean();
}

/**
 * Remove user verification record
 * @param {string} id 
 * @returns {Promise<Object>}
 */
function removeVerificationToken(id) {
  return UserVerificationModel.findOneAndDelete({ _id: id }).lean();
}

module.exports = {
  create,
  getUserByUsername,
  getUserByToken,
  createUserVerificationToken,
  setUserIsVerified,
  removeVerificationToken
}