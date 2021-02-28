export {};

import { Request, Response } from "express";
const { Router } = require("express");
const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
const router = Router();
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const sendGridKey =
  "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";
const transporter = nodemailer.createTransport(
  sendgrid({
    auth: {
      api_key: sendGridKey,
    },
  })
);

const generatePassword = (length = 6) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

const regEmail = (email: string, hashPassword: string) => {
  return {
    from: "felikssolomonov@gmail.com",
    to: email,
    subject: "Account created!",
    html: `
        <h4>Welcome to our internet shop!</h4>
        <p>hashPassword: ${hashPassword} !</p>
        <hr/>
    `,
  };
};

router.post("/register", async (req: any, res: any) => {
  try {
    const { name = "", email = "", password = "" } = req.body;
    const hashPassword = generatePassword(8);
    let user = await User.findOne({
      email: email,
    });
    if (user) {
      res.status(200).json({ status: 0, message: "email already in use" });
    } else {
      user = new User({
        name: name,
        email: email,
        password: password,
        hashPassword: hashPassword,
      });
      await user.save();
      // await transporter.sendMail(regEmail(email, hashPassword));
      res.status(200).json({ status: 1, message: "created" });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/registrConfirm", async (req: any, res: any) => {
  try {
    const { password } = req.body;
    console.log("password", password);
    console.log(req.session);
    const user = await User.findOne({
      email: "felikssolomonov@gmail.com",
    });
    req.session.user = user;
    req.session.isAuthentificated = true;
    req.session.save((err: Error) => {
      if (err) {
        console.log("session save error");
        throw err;
      }
      console.log("session saved");
    });
    console.log(req.session);
    // if (user) {
    //   user.password = await bcryptjs.hash(req.body.password, 10);
    //   user.resetToken = undefined;
    //   user.resetTokenExp = undefined;
    //   await user.save();
    //   res.redirect("/auth/login");
    // } else {
    //   req.flash("error", "token expired");
    //   res.redirect("/auth/login");
    // }
    res.status(200).json({ register: "registrConfirm", body: req.body });
  } catch (error) {
    console.log(error);
  }
});

router.post("/checkAuth", (req: any, res: any) => {
  if (!req.session.isAuthentificated) {
    console.log("don't isAuthentificated");
  } else {
    console.log("isAuthentificated");
  }
  res.status(200).json({ welcome: "Hello world!" });
});

router.delete("/logout", (req: any, res: any) => {
  if (req.session.isAuthentificated) {
    req.session.destroy(() => {
      //
    });
  }
  res.status(200).json({ welcome: "Hello world!" });
});

module.exports = router;
