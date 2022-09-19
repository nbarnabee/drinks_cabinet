const express = require("express");
const app = express();
const passport = require("passport");
const session = require("express-session");
const MongoClient = require("mongodb").MongoClient;
//const MongoStore = require("connect-mongo")(session);
// const flash = require("express-flash");
const logger = require("morgan");
const connectDB = require("./config/database");
const mainRoutes = require("./routes/main");

require("dotenv").config({ path: "./config/.env" });
// require("./config/passport")(passport);

connectDB();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger("dev"));
/*app.use(
  session({
    secret: "monitor dog",
    resave: false,
    saveUninitialized: false,
    store,
  })
);*/
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(flash());

app.use("/", mainRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
