const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Message = require("../models/message");
const User = require("../models/user");

exports.messages_get = asyncHandler(async (req, res, next) => {
  const messages = await getAllMessages();

  res.render("message-board", { messages });
});

exports.message_post = [
  body("message", "Message can't be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("userId", "Missing valid User ID").trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res, next) => {
    const error = validationResult(req);

    const message = new Message({
      message: req.body.message,
      date: new Date(),
      user: req.body.userId,
    });

    if (!error.isEmpty()) {
      const messages = await getAllMessages();

      res.render("message-board", { messages, errors: error.array() });
    } else {
      await Promise.all([
        message.save(),
        User.findByIdAndUpdate(req.body.userId, {
          $push: { messages: message._id },
        }),
      ]);
      res.redirect("/message-board");
    }
  }),
];

exports.delete_message_post = async (req, res, next) => {
  try {
    await Promise.all([
      Message.findByIdAndDelete(req.body.messageId),
      User.findByIdAndUpdate(req.body.userId, {
        $pull: { messages: req.body.messageId },
      }),
    ]);
  } catch (error) {
    next(error);
  } finally {
    res.redirect("/message-board");
  }
};

async function getAllMessages() {
  return await Message.find({}).populate("user").sort({ date: -1 }).exec();
}
