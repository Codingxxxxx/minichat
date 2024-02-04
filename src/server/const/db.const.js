const RegistrationMethod = {
  PASSWORD: 'PASSWORD',
  GOOGLE: 'GOOGLE',
  FACEBOOK: 'FACEBOOK'
}

const UserStatus = {
  BANNED: 'BANNED',
  SUSPENDED: 'SUSPENDED',
  ACTIVE: 'ACTIVE'
}

const MongoCollection = {
  USER: 'users',
  MESSAGE: 'messages',
  USER_VERIFICATION: 'user_verification'
}

const MessageType = {
  TEXT: 'TEXT',
  FILE: 'FILE'
}

module.exports = {
  RegistrationMethod,
  UserStatus,
  MongoCollection,
  MessageType
}