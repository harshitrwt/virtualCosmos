const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  socketId: String,
  userId: String,
  username: String,
  avatarStyle: String,
  avatarSeed: String,
  x: Number,
  y: Number,
  active: Boolean
});

module.exports = mongoose.model('Session', sessionSchema);