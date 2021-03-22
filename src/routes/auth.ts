export {};

const { Router } = require("express");
const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
const router = Router();
// const User = require("../models/userModel");
import User from "../models/userModel";
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sendgrid({
    auth: {
      api_key: process.env.sendGridKey,
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

const getErrorMessage = (errorCode: number) => {
  switch (errorCode) {
    case 0:
      return "Аккаунт подтвержден/залогинен";
    case 1:
      return "Разлогинен";
    case 5:
      return "Не верный логин или пароль";
    case 6:
      return "Аккаунт уже существует";
    case 7:
      return "Пользователя не существует";
    case 8:
      return "Не верный hashPassword";
    case 9:
      return "Одноразовый пароль выслан на почту";
    case 10:
      return "Неверные данные";
    case 11:
      return "Неизвестная ошибка";
    default:
      break;
  }
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

router.post("/registration", async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body;
    const hashPassword = generatePassword(8);
    let user = await User.findOne({
      email: email,
    });
    if (!(name && email && password)) {
      res.status(200).json({
        status: 10,
        message: getErrorMessage(10),
      });
      //"Неверные данные"
    } else if (user) {
      if (user.confirmed) {
        //пользователь уже есть и аккаунт подтвержден
        res.status(200).json({ status: 6, message: getErrorMessage(6) });
        //"Аккаунт уже существует"
      } else {
        //пользователь уже есть аккаунт не подтвержден
        const passwordHashed = await bcryptjs.hash(password, 10);
        user.name = name;
        user.confirmed = false;
        user.password = passwordHashed;
        user.hashPassword = hashPassword;
        await user.save();
        // await transporter.sendMail(regEmail(email, hashPassword));
        res.status(200).json({
          status: 9,
          message: getErrorMessage(9),
        });
        //"Одноразовый пароль выслан на почту"
      }
    } else {
      //новый пользователь
      const passwordHashed = await bcryptjs.hash(password, 10);
      user = new User({
        name: name,
        email: email,
        confirmed: false,
        password: passwordHashed,
        hashPassword: hashPassword,
      });
      await user.save();
      // await transporter.sendMail(regEmail(email, hashPassword));
      res.status(200).json({
        status: 9,
        message: getErrorMessage(9),
      });
      //"Одноразовый пароль выслан на почту"
    }
  } catch (error) {
    res.status(200).json({ status: 11, message: error });
    //"Неизвестная ошибка"
  }
});

router.post("/registrConfirm", async (req: any, res: any) => {
  try {
    const { email, hashPassword } = req.body;
    const user = await User.findOne({
      email: email,
    });
    if (!(email && hashPassword)) {
      res.status(200).json({
        status: 10,
        message: getErrorMessage(10),
      });
    } else if (user) {
      if (user.hashPassword === hashPassword) {
        //
        const token = generatePassword(16);
        user.confirmed = true;
        user.token = token;
        user.hashPassword = hashPassword;
        await user.save();
        req.session.user = user;
        req.session.isAuthentificated = true;
        req.session.save((err: Error) => {
          if (err) {
            throw err;
          }
        });
        res
          .status(200)
          .json({ status: 0, message: getErrorMessage(0), token: token });
      } else {
        res.status(200).json({ status: 8, message: getErrorMessage(8) });
      }
    } else {
      res.status(200).json({ status: 7, message: getErrorMessage(7) });
    }
  } catch (error) {
    res.status(200).json({ status: 11, message: error });
  }
});

router.post("/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email: email,
    });
    if (!(email && password)) {
      res.status(200).json({
        status: 10,
        message: getErrorMessage(10),
      });
      //"Неверные данные"
    } else if (user) {
      const correctPassword = await bcryptjs.compare(password, user.password);
      if (correctPassword) {
        const token = generatePassword(16);
        user.token = token;
        req.session.user = user;
        req.session.isAuthentificated = true;
        req.session.save((err: Error) => {
          if (err) {
            throw err;
          }
        });
        res
          .status(200)
          .json({ status: 0, message: getErrorMessage(0), token: token });
        //"Аккаунт подтвержден/залогинен"
      } else {
        res.status(200).json({ status: 5, message: getErrorMessage(5) });
        //"Не верный логин или пароль"
      }
    } else {
      res.status(200).json({ status: 7, message: getErrorMessage(7) });
      //"Пользователя не существует"
    }
  } catch (error) {
    res.status(200).json({ status: 11, message: error });
    //"Неизвестная ошибка"
  }
});

router.delete("/logout", async (req: any, res: any) => {
  if (req.session.isAuthentificated) {
    // const token = generatePassword(16);
    req.session.destroy(() => {
      //
    });
    const user = await User.findOne({
      _id: req.session.user._id,
    });
    if (user) {
      user.token = null;
      await user.save();
    }
    res.status(200).json({ status: 1, message: getErrorMessage(1) });
  } else {
    res.status(200).json({ status: 11, message: getErrorMessage(11) });
  }
});

router.post("/checkAuth", async (req: any, res: any) => {
  if (!req.session.isAuthentificated) {
    console.log("don't isAuthentificated");
    res.status(200).json({ status: 11, message: getErrorMessage(11) });
  } else {
    console.log("isAuthentificated");
    res.status(200).json({ status: 11, message: getErrorMessage(11) });
  }
});

module.exports = router;
