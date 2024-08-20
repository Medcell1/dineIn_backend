const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Input a Name"],
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    workingHours: {
      type: [
        {
          day: { type: String, required: true },
          openTime: { type: String, default: "09:00 AM" },
          closeTime: { type: String, default: "09:00 PM" },
        },
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
