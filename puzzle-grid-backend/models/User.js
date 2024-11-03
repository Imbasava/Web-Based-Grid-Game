// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('User', UserSchema);
