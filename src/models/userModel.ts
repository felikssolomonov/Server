const { Schema, model } = require("mongoose");

const userModel = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: String,
  hashPassword: String,
});

module.exports = model("User", userModel);
