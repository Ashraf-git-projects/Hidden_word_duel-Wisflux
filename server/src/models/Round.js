const mongoose = require("mongoose");

const roundSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
  },
  word: {
    type: String,
    required: true,
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    default: null,
  },
  roundNumber: {
    type: Number,
  },
}, { timestamps: true });

module.exports = mongoose.model("Round", roundSchema);