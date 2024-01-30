const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const Message = require("../models/message");
const User = require("../models/user");

exports.messages_get = asyncHandler(async (req, res, next) => {
  const messages = await getAllMessages();

  res.send(messages);
});

exports.message_post = [
  body("message", "Message can't be empty.")
    .trim()
    .isLength({ min: 1 })
    .isLength({ max: 150 })
    .withMessage("Your message is over the character limit.")
    .escape(),
  body("userId", "Missing valid User ID").trim().isLength({ min: 1 }).escape(),

  async (req, res, next) => {
    const error = validationResult(req);

    const message = new Message({
      message: req.body.message,
      date: new Date(),
      user: req.body.userId,
    });

    if (!error.isEmpty()) {
      res.status(400).send(error.array());
    } else {
      try {
        await Promise.all([
          message.save(),
          User.findByIdAndUpdate(req.body.userId, {
            $push: { messages: message._id },
          }),
        ]);
        res.send(message);
      } catch (error) {
        return res.status(400).send({ message: "Something went wrong" });
      }
    }
  },
];

exports.delete_message_post = async (req, res, next) => {
  try {
    if (req.body.admin) {
      await Promise.all([
        Message.findByIdAndDelete(req.params.messageId),
        User.findOneAndUpdate(
          { username: req.body.username },
          {
            $pull: { messages: req.params.messageId },
          }
        ),
      ]);
      const messages = await getAllMessages();
      return res.send(messages);
    }

    res.status(403).send("Don't have permission.");
  } catch (error) {
    res.send(error);
  }
};

async function getAllMessages() {
  return await Message.find({}, { __v: 0 })
    .populate("user", "username avatar -_id")
    .sort({ date: 1 })
    .exec();
}
