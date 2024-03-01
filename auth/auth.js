const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.verifyJWT = async (req, res, next) => {
  const token = req.cookies["jwt-token"];

  if (!token) {
    return res.sendStatus(403);
  }

  try {
    const data = jwt.verify(token, process.env.SECRET_TOKEN_KEY);
    res.locals.currentUser = data.user;
    return next();
  } catch (error) {
    return res.status(500).send(error);
  }
};
