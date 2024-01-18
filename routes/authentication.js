var express = require("express");
var router = express.Router();
const authenticationController = require("../controllers/authenticationController");

router.post("/login", authenticationController.login_post);
router.post("/automatic-login", authenticationController.automatic_login);
router.post("/logout", authenticationController.logout);

module.exports = router;
