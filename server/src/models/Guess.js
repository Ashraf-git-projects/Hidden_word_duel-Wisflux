const mongoose = require("mongoose");

const guessSchema = new mongoose.Schema({
  round: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Round",
    required: true,
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  guessText: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model("Guess", guessSchema);
