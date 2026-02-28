const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  totalWins: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("Player", playerSchema);