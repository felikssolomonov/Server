// const User = require("../models/userModel");
import User from "../models/userModel";

module.exports = async function (req: any, res: any, next: Function) {
  if (!req.session.user) {
    return next();
  }
  req.user = await User.findById(req.session.user._id);
  next();
};
