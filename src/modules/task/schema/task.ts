import mongoose, {Schema,model,Types} from "mongoose";
import {ITask} from "../types";

const task = new Schema<ITask>({
    taskName: {
        type: String,
        required: true
    },
    taskDesp: {
        type: String
    },
    taskStatus: {
        type: String,
        default: 'Pending'
    },
    requireTime: {
        type: String
    },
    taskDate: {
        type: Date,
        default: Date.now
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    }
});

export const TaskModel = model<ITask>("task",task);