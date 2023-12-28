const { Schema, model } = require("mongoose");
const { format } = require("date-fns");

const MessageSchema = new Schema({
  message: { type: String, required: true },
  date: { type: Date, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User" },
});

MessageSchema.virtual("formatted_date").get(function () {
  return format(this.date, "MMM do h:mm a");
});

module.exports = model("Message", MessageSchema);
