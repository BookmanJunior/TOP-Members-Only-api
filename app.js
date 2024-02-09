var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
const passport = require("passport");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const cors = require("cors");
const auth = require("./auth/auth");
require("dotenv").config();

main().catch((error) => debug(error));

async function main() {
  await mongoose.connect(process.env.DBURI);
}

const RateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100,
});

const indexRouter = require("./routes/index");
const authRouter = require("./routes/authentication");
const signUpRouter = require("./routes/sign-up");
const messageBoardRouter = require("./routes/message-board");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(helmet());
app.use(RateLimiter);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/", indexRouter);
app.use("/sign-up", signUpRouter);
app.use("/message-board", auth.verifyJWT, messageBoardRouter);
app.use("/auth", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
