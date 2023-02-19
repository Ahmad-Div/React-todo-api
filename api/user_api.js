import User from "../model/User_model.js";
import express from "express";
import auth from "../middleware/auth.js";
import authOwner from "../middleware/authOwner.js";
import authAdmin from "../middleware/authAdmin.js";
import Todo from "../model/Todo_model.js";
import Plan from "../model/Plan_model.js";
import Result from "../model/Result_model.js";

const userApp = express.Router();

//GET USER TOKEN
//@access privet

userApp.get("/jwt_token", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

//GET USERS ADMIN
//@access privet

userApp.get("/", authAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//GET USERS
//@access privet

userApp.get("/", auth, async (req, res) => {
  try {
    const users = await User.find().select("name image");
    res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//GET ONE USER
//@access privet

userApp.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).json({ error: "user does not exist" });
    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//GET SELF USER
//@access privet

userApp.get("/get/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//PUT ONE USER
//@access privet

userApp.put("/:id", authOwner, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { $set: req.body }, { new: true });
    let { password, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//PUT ONE USER
//@access privet

userApp.put("/notification/:id", authOwner, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    user.notification = !user.notification;
    await user.save();
    let { password, role, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//DELETE ONE USER
//@access privet

userApp.delete("/:id", authOwner, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    await Todo.findOneAndDelete({ user: req.user.id });
    await Plan.findOneAndDelete({ user: req.user.id });
    await Result.findOneAndDelete({ user: req.user.id });
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

export default userApp;
