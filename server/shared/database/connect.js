import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectDb(uri = env.mongoUri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  return mongoose.connection;
}

export async function disconnectDb() {
  await mongoose.disconnect();
}
