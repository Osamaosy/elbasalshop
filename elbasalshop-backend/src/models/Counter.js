const mongoose = require('mongoose');

// Counter model for atomic incrementing
// Used to generate unique order numbers without race conditions
const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  seq: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Counter', counterSchema);