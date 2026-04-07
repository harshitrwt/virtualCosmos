const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  username: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  avatarStyle: { type: String, default: 'avataaars' },
  avatarSeed: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);