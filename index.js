import express from "express";
import connectDb from "./database.js";
import cors from "cors";
import authApp from "./api/auth_api.js";
import dotenv from "dotenv";
import userApp from "./api/user_api.js";
import todoApp from "./api/todo_api.js";
dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.REACT_LOCAL_HOST,
    optionsSuccessStatus: 200,
  })
);

app.use("/api/auth", authApp);
app.use("/api/user", userApp);
app.use("/api/todo", todoApp);
connectDb();

app.listen(process.env.PORT, () => {
  console.log("server run");
});
