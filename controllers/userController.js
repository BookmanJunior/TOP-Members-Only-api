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

  asyncHandler(async (req, res, next) => {
    const error = validationResult(req);

    const user = new User({
      username: req.body.username,
    });

    await user
      .generateHash(req.body.password)
      .then((hashedPassword) => (user.password = hashedPassword));

    if (!error.isEmpty()) {
      res.render("sign-up", { user, errors: error.array() });
      return;
    }

    await user.save();
    res.redirect("/");
  }),
];
