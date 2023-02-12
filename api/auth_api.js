import User from "../model/User_model.js";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Todo from "../model/Todo_model.js";
import Plan from "../model/Plan_model.js";
import Result from "../model/Result_model.js";
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
    let user = await User.findOne({ email: email });
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

    user = await User.findOne({ email: email }).select("-password -_id -role");

    res.status(200).json({
      data: user,
      token: token,
    });
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

export default authApp;
