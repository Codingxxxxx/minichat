const { Schema, model, SchemaTypes } = require('mongoose');
const { MongoCollection, MessageType } = require('../const').DB;

const schema = new Schema({
  from: {
    type: SchemaTypes.ObjectId,
    ref: MongoCollection.USER
  },
  to: {
    type: SchemaTypes.ObjectId,
    ref: MongoCollection.USER
  },
  messageType: {
    type: String,
    enum: Object.values(MessageType),
    default: MessageType.TEXT
  },
  textContent: {
    type: String
  },
  files: [{
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
    },
    caption: {
      type: String
    }
  }],
  isSeen: {
    type: Boolean,
    required: true,
    default: false
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
})

schema.plugin(require('mongoose-aggregate-paginate-v2'));

const MessageModel = model(MongoCollection.VERIFICATION_TOKEN);

module.exports = {
  MessageModel
}