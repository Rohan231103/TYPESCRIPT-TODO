import { query } from "express";
import { UserModel } from "./schema";

export const getUserByQuery = async(query:any) => {
    const user = await UserModel.find(query)
    .find({}, { _id: 0, __v: 0, password: 0 })
    .populate("role", "-_id -permissions -__v");
    return user;
}