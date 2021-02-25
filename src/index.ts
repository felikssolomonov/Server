const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const homeRouter = require("./routes/home");
const PORT = process.env.PORT || 3001;
const password = "sviFRrX7Dv3hTUyv";
const dbName = "ChatWebServer";
const connection =
  "mongodb+srv://Daniel:" + password + "@cluster0.paa0o.mongodb.net/" + dbName;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use("/", homeRouter);

const start = async () => {
  try {
    await mongoose.connect(connection, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    app.listen(PORT, () => {
      console.log("Server is running on port " + PORT);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
