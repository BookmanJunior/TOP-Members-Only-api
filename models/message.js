const { Schema, model } = require("mongoose");
const User = require("./user");

const MessageSchema = new Schema({
  message: { type: String, required: true },
  date: { type: Date, required: true },
  user: { type: Schema.Types.ObjectId, ref: User },
});

module.exports = model("Message", MessageSchema);
