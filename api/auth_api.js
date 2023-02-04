import User from "../model/User_model.js";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Todo from "../model/Todo_model.js";
const authApp = express.Router();

//POST REGISTER
//@access public

authApp.post("/", async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ error: "user is exist" });
    user = new User(req.body);
    await user.save();
    const salt = await bcrypt.genSalt(16);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ error: error });
  }
});

//POST LOGIN
//@access public

authApp.post("/login", async (req, res) => {
  let { email, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ error: "please enter data" });
    let user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ error: "user does not exist" });
    console.log(user);
    let isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ error: "wrong data" });
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

    res.status(200).json({
      user: user,
      token: token,
    });
  } catch (error) {
    return res.status(400).json({ error: error });
  }
});

export default authApp;
