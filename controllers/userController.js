const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.sign_up_get = asyncHandler(async (req, res, next) => {
  res.render("sign-up");
});

exports.sign_up_post = [
  body("username")
    .custom(async (value) => {
      const trimmedValue = value.trim();
      if (!trimmedValue.length || value < 4) {
        throw new Error("Username must be at least 4 characters long.");
      }
    })
    .isLength({ max: 13 })
    .withMessage("Username can't be longer than 12 characters.")
    .custom(async (value) => {
      const user = await User.find({ username: value })
        .collation({ locale: "en", strength: 2 })
        .exec();

      if (user.length)
        throw new Error(
          `${value} already exists. Please pick a different username.`
        );
    })
    .escape(),
  body("password", "Password must be at least 8 characters long.")
    .trim()
    .isLength({ min: 8 })
    .escape(),
  body("confirmPassword")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Confirm Password must be at least 8 characters long.")
    .custom(async (value, { req }) => {
      if (req.body.password !== value)
        throw new Error("Passwords don't match.");
    })
    .escape(),
  body("avatar")
    .trim()
    .custom(async (value) => {
      const validAvatars = [
        "gray",
        "red",
        "pink",
        "brown",
        "blue",
        "lime",
        "orange",
        "green",
      ];
      if (!validAvatars.includes(value))
        throw new Error("Please choose an avatar.");
    })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const error = validationResult(req);

    const user = new User({
      username: req.body.username,
      avatar: req.body.avatar,
    });

    await user
      .generateHash(req.body.password)
      .then((hashedPassword) => (user.password = hashedPassword));

    if (!error.isEmpty()) {
      return res.status(400).send(error.array());
    }

    await user.save();

    const body = { _id: user._id, username: user.username, admin: user.admin };
    const token = jwt.sign({ user: body }, process.env.SECRET_TOKEN_KEY, {
      expiresIn: "10m",
    });

    const expirationDate = new Date();

    const cookieOptions = {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: expirationDate.setDate(expirationDate.getDate() + 7),
    };

    res.cookie("jwt-token", token, cookieOptions);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        admin: user.admin,
        avatar: user.avatar,
      },
    });
  }),
];
