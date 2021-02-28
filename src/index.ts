const { express, path, mongoose, cors, session, csrf } = require("./packages");

const { homeRouter, authRoutes } = require("./routes");

const { sessionMiddleware, userMiddleware } = require("./middleware");

const {
  app,
  PORT,
  db_connection,
  cors_options,
  session_options,
  mongoose_options,
} = require("./initial");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session(session_options));
// app.use(csrf());
app.use(sessionMiddleware);
app.use(userMiddleware);

app.use(cors(cors_options));

app.use("/", homeRouter);
app.use("/auth", authRoutes);

const start = async () => {
  try {
    await mongoose.connect(db_connection, mongoose_options);
    app.listen(PORT, () => {
      console.log("Server is running on port " + PORT);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
