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

const FriendRequestStatus = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PENDING: 'PENDING'
}

module.exports = {
  RegistrationMethod,
  UserStatus,
  MongoCollection,
  MessageType,
  FriendRequestStatus
}