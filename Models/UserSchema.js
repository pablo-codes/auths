const mongoose = require("mongoose");

const User = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  googleid: String,
  img: String,
  passcode: String,
  token: String,
}, { timestamps: true });

module.exports = new mongoose.model("User", User);
