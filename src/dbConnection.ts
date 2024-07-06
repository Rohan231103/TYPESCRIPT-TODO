import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const DB = process.env.DB_URL as string;

export const connectDb = () => {
  return mongoose.connect(DB);
};
