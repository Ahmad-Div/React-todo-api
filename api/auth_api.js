import User from "../model/User_model.js";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Todo from "../model/Todo_model.js";
import Plan from "../model/Plan_model.js";
import Result from "../model/Result_model.js";
import dotenv from "dotenv";
import { getVerifyCode, sendCode } from "../nodemailer.js";
dotenv.config();
const authApp = express.Router();

//POST REGISTER
//@access public

authApp.post("/", async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).json({
        error: {
          other: "user is exist",
        },
      });
    user = new User(req.body);
    await user.save();
    const salt = await bcrypt.genSalt(16);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    let { password, _id, role, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//POST GOOGLE REGISTER
//@access public

//POST LOGIN
//@access public

authApp.post("/login", async (req, res) => {
  let { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({
        error: {
          other: "please enter data",
        },
      });

    let user = await User.findOne({
      $or: [{ email: email }, { username: email }],
    });
    if (!user)
      return res.status(400).json({
        error: {
          other: "wrong data",
        },
      });
    let isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({
        error: {
          other: "wrong data",
        },
      });
    const payload = {
      user: {
        username: user.username,
        id: user._id,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });
    if (!token) return res.status(400).json({ error: "error while generate token" });
    req.headers.cookie = token;
    //make default todo

    let UserTodo = await Todo.findOne({ user: user._id });
    if (!UserTodo) {
      UserTodo = new Todo({
        user: user.id,
        collections: [
          {
            name: "home",
            icon: "fa-house",
            todos: [],
          },
        ],
      });
      await UserTodo.save();
    }

    let UserPlan = await Plan.findOne({ user: user._id });
    if (!UserPlan) {
      UserPlan = new Plan({
        user: user.id,
        collections: [
          {
            name: "home",
            icon: "fa-house",
            plans: [],
          },
        ],
      });
      await UserPlan.save();
    }

    let userResult = await Result.findOne({ user: user._id });
    if (!userResult) {
      userResult = new Result({
        user: user._id,
        completedTodo: [
          {
            day: "Monday",
            count: 0,
          },
          {
            day: "Thursday",
            count: 0,
          },
          {
            day: "Wednesday",
            count: 0,
          },
          {
            day: "Tuesday",
            count: 0,
          },
          {
            day: "Friday",
            count: 0,
          },
          {
            day: "Saturday",
            count: 0,
          },
          {
            day: "Sunday",
            count: 0,
          },
        ],
        completedPlan: [
          {
            day: "Monday",
            count: 0,
          },
          {
            day: "Thursday",
            count: 0,
          },
          {
            day: "Wednesday",
            count: 0,
          },
          {
            day: "Tuesday",
            count: 0,
          },
          {
            day: "Friday",
            count: 0,
          },
          {
            day: "Saturday",
            count: 0,
          },
          {
            day: "Sunday",
            count: 0,
          },
        ],
      });
      await userResult.save();
    }

    user = await User.findOne({
      $or: [{ email: email }, { username: email }],
    }).select("-password");

    res.status(200).json({
      data: user,
      token: token,
    });
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

//POST AUTH EMAIL
let email = "";
authApp.post("/authentication", async (req, res) => {
  if (!req.body.email)
    return res.status(400).json({
      error: {
        other: "please enter your email",
      },
    });
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json({
      error: {
        other: "wrong email",
      },
    });
  email = user.email;
  sendCode(req.body.email);
  res.status(200).json({ message: "code sent" });
});

//POST RESEND EMAIL

authApp.post("/re_send", async (req, res) => {
  const user = await User.findOne({ email: email });
  if (!user)
    return res.status(400).json({
      error: {
        other: "wrong email",
      },
    });
  sendCode(user.email);
  res.status(200).json({ message: "code sent" });
});

//POST CODE
authApp.post("/code", async (req, res) => {
  if (!req.body.code)
    return res.status(400).json({
      error: {
        other: "please enter your code",
      },
    });
  if (req.body.code !== getVerifyCode())
    return res.status(400).json({
      error: {
        other: "wrong code",
      },
    });

  //authenticate user
  let user = await User.findOne({ email: email });
  if (!user)
    return res.status(400).json({
      error: {
        other: "the email was wrong",
      },
    });

  user.isAuthenticated = true;
  await user.save();
  email = "";
  return res.status(200).json("user authenticated");
});

//POST FORGET PASSWORD
let passwordEmail = "";
authApp.post("/password", async (req, res) => {
  if (!req.body.email)
    return res.status(400).json({
      error: {
        other: "please enter your email",
      },
    });
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json({
      error: {
        other: "wrong email",
      },
    });
  passwordEmail = user.email;
  sendCode(req.body.email);
  res.status(200).json({ message: "code sent" });
});

//POST RESEND EMAIL PASSWORD FORGET

authApp.post("/password_re_send", async (req, res) => {
  const user = await User.findOne({ email: passwordEmail });
  if (!user)
    return res.status(400).json({
      error: {
        other: "wrong email",
      },
    });
  sendCode(user.email);
  res.status(200).json({ message: "code sent" });
});

//POST CODE FORGET PASSWORD
authApp.post("/password_code", async (req, res) => {
  if (!req.body.code)
    return res.status(400).json({
      error: {
        other: "please enter your code",
      },
    });
  if (req.body.code !== getVerifyCode())
    return res.status(400).json({
      error: {
        other: "wrong code",
      },
    });

  //authenticate user
  let user = await User.findOne({ email: passwordEmail });
  if (!user)
    return res.status(400).json({
      error: {
        other: "the email was wrong",
      },
    });

  user.isAuthenticated = true;
  await user.save();
  return res.status(200).json("user authenticated");
});

authApp.post("/change_password", async (req, res) => {
  if (!req.body.password)
    return res.status(400).json({
      error: {
        other: "please enter your new password",
      },
    });
  let user = await User.findOne({ email: passwordEmail });
  if (!user)
    return res.status(400).json({
      error: {
        other: "the email was wrong",
      },
    });
  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (isMatch)
    return res.status(400).json({
      error: {
        other: "you can't use the same password",
      },
    });
  const salt = await bcrypt.genSalt(16);
  req.body.password = await bcrypt.hash(req.body.password, salt);
  user.password = req.body.password;
  await user.save();
  passwordEmail = "";

  return res.status(200).json({ message: "password changed" });
});

export default authApp;
