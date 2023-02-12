import express from "express";
import authOwner from "../middleware/authOwner.js";
import Result from "../model/Result_model.js";
const resultApp = express.Router();

resultApp.get("/todo/:id", authOwner, async (req, res) => {
  try {
    const result = await Result.findOne({ user: req.user.id });
    return res.status(200).json(result.completedTodo);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

resultApp.get("/plan/:id", authOwner, async (req, res) => {
  try {
    const result = await Result.findOne({ user: req.user.id });
    return res.status(200).json(result.completedPlan);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

export default resultApp;
