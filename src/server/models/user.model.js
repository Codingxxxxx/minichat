const { Schema, model } = require('mongoose');
const { RegistrationMethod, UserStatus, MongoCollection } = require('../const').DB;

const schema = new Schema({
  username: {
    type: String,
    required: true,
    maxLength: 15,
    unique: true
  },
  displayName: {
    type: String,
    required: true,
    maxLength: 15
  },
  password: {
    type: String
  },
  salt: {
    type: String
  },
  email: {
    type: String
  },
  avatar: {
    fileUrl: {
      type: String
    },
    filename: {
      type: String
    },
    size: {
      type: Number
    },
    mimetype: {
      type: String
    }
  },
  registrationMethod: {
    type: String,
    enum: Object.values(RegistrationMethod),
    required: true,
    default: RegistrationMethod.PASSWORD
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVE
  },
  loginHistory: [{
    loginAt: {
      type: Date,
      required: true
    },
    ip: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String
    }
  }],
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
})

schema.plugin(require('mongoose-aggregate-paginate-v2'));

const UserModel = model(MongoCollection.USER, schema);

module.exports = {
  UserModel
}