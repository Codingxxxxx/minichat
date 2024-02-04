const { Schema, model, SchemaTypes } = require('mongoose');
const { MongoCollection } = require('../const').DB;

const schema = new Schema({
  userId: {
    type: SchemaTypes.ObjectId,
    ref: MongoCollection.USER,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
})

schema.plugin(require('mongoose-aggregate-paginate-v2'));

const UserVerificationModel = model(MongoCollection.USER_VERIFICATION, schema);

module.exports = { UserVerificationModel };
