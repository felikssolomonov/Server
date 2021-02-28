export {};

const { express, dotenv, MongoStore } = require("./packages");

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3001;
const db_password = process.env.db_password;
const db_name = process.env.db_name;

const db_connection =
  "mongodb+srv://Daniel:" +
  db_password +
  "@cluster0.paa0o.mongodb.net/" +
  db_name;

const cors_options = {
  origin: true,
  credentials: true,
};

const store = new MongoStore({
  collection: "sessions",
  uri: db_connection,
});

const session_options = {
  secret: process.env.session_secret,
  resave: false,
  saveUninitialized: false,
  store: store,
};

const mongoose_options = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

module.exports = {
  app,
  PORT,
  db_connection,
  cors_options,
  session_options,
  mongoose_options,
};
