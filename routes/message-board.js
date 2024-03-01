const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.get("/", messageController.messages_get);

router.post("/", messageController.message_post);

router.delete("/:messageId", messageController.message_delete);

module.exports = router;
