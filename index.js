import express from "express";
import connectDb from "./database.js";
import cors from "cors";
import authApp from "./api/auth_api.js";
import dotenv from "dotenv";
import userApp from "./api/user_api.js";
import todoApp from "./api/todo_api.js";
import planApp from "./api/plan_api.js";
import multer from "multer";
import path from "path";
// Import the functions you need from the SDKs you need
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";
import authOwner from "./middleware/authOwner.js";
import resultApp from "./api/result_api.js";

dotenv.config();
const app = express();

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDR2HoIlz3mC_WFBdh3gm-5zYG1U8wUHIo",
  authDomain: "todo-app-f235c.firebaseapp.com",
  projectId: "todo-app-f235c",
  storageBucket: "todo-app-f235c.appspot.com",
  messagingSenderId: "698137510089",
  appId: "1:698137510089:web:a8659d139d8c5181d18d18",
  measurementId: "G-V1ZP8J1WJS",
};

// Initialize Firebase
initializeApp(firebaseConfig);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.REACT_HOST,
    optionsSuccessStatus: 200,
  })
);

app.use("/api/auth", authApp);
app.use("/api/user", userApp);
app.use("/api/todo", todoApp);
app.use("/api/plan", planApp);
app.use("/api/result", resultApp);
connectDb();

app.listen(process.env.PORT, () => {
  console.log("server run");
});

const uploader = multer({ storage: multer.memoryStorage() });
const storage = getStorage();

app.post("/api/upload/userImage/:id", authOwner, uploader.single("userImageUpload"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file was uploaded.");
  }

  const file = req.file;
  let uploadedFilename = file.originalname.split(".")[0] + "-" + Date.now() + path.extname(file.originalname);

  const storageRef = ref(storage, `user-images/${uploadedFilename}`);

  const uploadTask = uploadBytesResumable(storageRef, file.buffer);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    },
    (error) => {
      res.status(400).json({ warning: error });
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        res.status(200).json({ message: "uploaded", url: downloadURL });
      });
    }
  );
});
