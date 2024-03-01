const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const errorArr = [
  {
    type: "field",
    msg: "Incorrect username or password.",
    path: "login",
  },
];

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username }).exec();

      if (!user) {
        return done(null, false, errorArr);
      }

      const isValidPassword = await user.validatePassword(password);

      if (!isValidPassword) {
        return done(null, false, errorArr);
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

exports.login_post = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    try {
      if (!user) {
        return res.status(401).send(errorArr);
      }

      if (err) {
        return res.status(401).send(err);
      }

      req.logIn(user, { session: false }, (err) => {
        if (err) return res.sendStatus(401);
      });
      const body = {
        _id: user._id,
        username: user.username,
        admin: user.admin,
        avatar: user.avatar,
      };

      const token = jwt.sign({ user: body }, process.env.SECRET_TOKEN_KEY, {
        expiresIn: "7d",
      });

      const cookieOptions = {
        secure: true,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7 * 1000, //7 days
        sameSite: "none",
      };

      res.cookie("jwt-token", token, cookieOptions);

      return res.json({
        user: {
          id: user._id,
          username: user.username,
          admin: user.admin,
          avatar: user.avatar,
        },
      });
    } catch (err) {
      return res.sendStatus(401);
    }
  })(req, res, next);
};

exports.automatic_login = async (req, res, next) => {
  const token = req.cookies["jwt-token"];

  if (!token) {
    return res.sendStatus(403);
  }

  try {
    const data = jwt.verify(token, process.env.SECRET_TOKEN_KEY);
    res.json({
      user: {
        id: data.user._id,
        username: data.user.username,
        admin: data.user.admin,
        avatar: data.user.avatar,
      },
    });
  } catch (error) {
    res.sendStatus(403);
  }
};

exports.logout = async (req, res, next) => {
  try {
    return res
      .status(200)
      .clearCookie("jwt-token")
      .send({ message: "Successfully logged you out." });
  } catch (error) {
    return next(error);
  }
};
