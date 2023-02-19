import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    username: {
      type: String,
      required: [true, "username is required"],
      unique: [true, "username must be unique"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email must be unique"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      min: [6, "maximum character is 6"],
      max: [16, "maximum character is 16"],
    },
    isAuthenticated: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "user",
    },
    image: {
      type: String,
      default: "",
    },
    notification: {
      type: Boolean,
      default: true,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
  { timestamps: true }
);

UserSchema.post("validate", function (error, doc, next) {
  if (error) {
    const errors = {};
    for (const field in error.errors) {
      errors[field] = error.errors[field].message;
    }
    next(errors);
  } else {
    next();
  }
});

const User = new mongoose.model("user", UserSchema);

export default User;
