const mongoose = require("mongoose");
const { Schema } = mongoose;
const Message = require("./message");
const bcrypt = require("bcryptjs");

const UserSchema = new Schema({
  username: { type: String, required: true, trim: true },
  password: { type: String, required: true, minLength: 8 },
  messages: [{ type: Schema.Types.ObjectId, ref: Message }],
});

UserSchema.methods.generateHash = function (password) {
  return bcrypt.hash(password, 10);
};

UserSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
