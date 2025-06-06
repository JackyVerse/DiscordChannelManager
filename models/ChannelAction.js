const mongoose = require('mongoose');

const channelActionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  channelId: {
    type: String,
    required: true
  },
  channelName: {
    type: String,
    required: true
  },
  roleId: {
    type: String,
    required: true
  },
  roleName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['add', 'remove'],
    required: true
  },
  performedBy: {
    type: String,
    required: true
  },
  performedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChannelAction', channelActionSchema); 