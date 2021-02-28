export {};

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const MongoStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");

module.exports = {
  express,
  path,
  mongoose,
  cors,
  session,
  dotenv,
  MongoStore,
  csrf,
};
