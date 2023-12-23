const mongoose = require("mongoose");
const { Schema } = mongoose;
const User = require("./user");

const MessageSchema = new Schema({
  message: { type: String, required: true },
  date: { type: Date, required: true },
  user: { type: Schema.Types.ObjectId, ref: User, required: true },
});

module.exports = mongoose.model("Message", MessageSchema);
