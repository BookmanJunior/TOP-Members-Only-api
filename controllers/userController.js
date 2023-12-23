const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.sign_up_get = asyncHandler(async (req, res, next) => {
  res.render("sign-up");
});

exports.sign_up_post = [
  body("username", "Username can't be empty.")
    .trim()
    .isLength({ min: 1, max: 15 })
    .escape(),
  body("password", "Password must be at least 8 characters long.")
    .trim()
    .isLength({ min: 8 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const error = validationResult(req);

    const user = new User({
      username: req.body.username,
    });

    const UsernameExists = await User.find({
      username: req.body.username,
    })
      .collation({ locale: "en", strength: 2 })
      .exec();

    await user
      .generateHash(req.body.password)
      .then((hashedPassword) => (user.password = hashedPassword));

    if (!error.isEmpty()) {
      res.render("sign-up", { user, errors: error.array() });
      return;
    }

    if (UsernameExists.length) {
      const error = new Error(
        `${req.body.username} already exists. Please pick a different username.`
      );
      res.render("sign-up", {
        user,
        errors: [error],
      });
      return;
    }

    await user.save();
    res.redirect("/");
  }),
];
