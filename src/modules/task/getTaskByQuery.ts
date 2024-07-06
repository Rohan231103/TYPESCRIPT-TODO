import { query } from "express";
import { TaskModel } from "./schema";

export const getTaskByQuery = async(query:any) => {
    const task = await TaskModel.find(query,{ _id: 0, __v: 0 })
    .populate({
        path: 'assignedTo',
        select: "-_id -password -__v -permissions",
        populate: {
            path: "role",
            select: "-_id -password -__v -permissions",
            model: "role"
        }
    })
    .populate({
        path: 'assignedBy',
        select: "-_id -password -__v -permissions",
        populate: {
            path: "role",
            select: "-_id -password -__v -permissions",
            model: "role"
        }
    })
    return task;
}