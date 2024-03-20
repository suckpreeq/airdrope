const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  twitterHandle: {
    type: String,
    required: true,
    unique: true,
  },
  telegramHandle: {
    type: String,
    required: true,
    unique: true,
  },
  referals: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  referer: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  history: {
    type: Array,
    default: [],
  },
});

module.exports = model("Users", userSchema);
