const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.verifyJWT = async (req, res, next) => {
  const token = req.cookies["jwt-token"];

  if (!token) {
    return res.sendStatus(403);
  }

  try {
    const data = jwt.verify(token, process.env.SECRET_TOKEN_KEY);
    req.body.userId = data.user._id;
    req.body.username = data.user.username;
    req.body.admin = data.user.admin;
    req.body.avatar = data.user.avatar;
    return next();
  } catch (error) {
    return res.sendStatus(403);
  }
};
