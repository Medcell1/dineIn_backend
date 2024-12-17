const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalMenuItems: {
    type: Number,
    default: 0
  },
  recentMenuItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu'
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const UserStats = mongoose.model('UserStats', userStatsSchema);

module.exports = UserStats;
