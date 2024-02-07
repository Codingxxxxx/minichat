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

/**
 * Create user history when login
 * @param {string} userId
 * @param {Object} loginHistory
 * @param {Date} loginHistory.loginAt
 * @param {string} loginHistory.ip
 * @param {string} loginHistory.address
 * @param {string} loginHistory.userAgent 
 * @returns 
 */
function addLoginHistory(userId, { loginAt, ip, address, userAgent }) {
  return UserModel.findOneAndUpdate({ _id: userId }, {
    $push: {
      loginHistory: {
        loginAt,
        ip,
        address,
        userAgent
      }
    }
  })
}

/**
 * get a user by id
 * @param {string} id user id 
 * @returns {Promise<any>}
 */
function getUserById(id) {
  return UserModel.findById(id).select('_id username displayName avatar email isVerified status createdAt').lean();
}

/**
 * 
 * @param {string} userId 
 * @param {Object} avatar
 * @param {string} avatar.fileUrl
 * @param {string} avatar.filename
 * @param {number} avatar.size
 * @param {string} avatar.mimetype  
 * @returns {Promise<any>}
 */
function updateAvatar(userId, { fileUrl, filename, size, mimetype }) {
  return UserModel.findByIdAndUpdate(userId, {
    avatar: {
      fileUrl,
      filename,
      size,
      mimetype
    }
  }).lean();
}

module.exports = {
  create,
  getUserByUsername,
  getUserByToken,
  createUserVerificationToken,
  setUserIsVerified,
  removeVerificationToken,
  addLoginHistory,
  getUserById,
  updateAvatar
}