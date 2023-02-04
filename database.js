import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const db = process.env.MONGO_URL;
const connectDb = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(db, {
      useNewUrlParser: true,
    });
    console.log("mongodb connected");
  } catch (error) {
    console.log(error);
  }
};

export default connectDb;
