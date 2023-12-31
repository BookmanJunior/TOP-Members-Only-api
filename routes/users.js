var express = require("express");
var router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username }).exec();

      if (!user) {
        return done(null, false, { message: "Username not found." });
      }

      const isValidPassword = await user.validatePassword(password);

      if (!isValidPassword) {
        return done(null, false, { message: "Incorrect password." });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    return done(null, user);
  } catch (error) {
    return done(error);
  }
});

router.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/message-board",
    failureRedirect: "/",
    failureFlash: true,
  })
);

module.exports = router;
