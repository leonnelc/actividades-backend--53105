const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

module.exports = RefreshToken;
