const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
  },
  score1: {
    type: Number,
    default: 0,
  },
  score2: {
    type: Number,
    default: 0,
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    default: null,
  },
  status: {
    type: String,
    enum: ["ongoing", "completed"],
    default: "ongoing",
  },
}, { timestamps: true });

module.exports = mongoose.model("Match", matchSchema);