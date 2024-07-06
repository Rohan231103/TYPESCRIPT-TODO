import mongoose, { Types, Document } from "mongoose";
import { IUser } from "../../user";
import { isUndefined, omitBy } from "lodash";

export interface ITask{
    _id?: string;
    taskName: string;
    taskDesp?: string;
    taskStatus: string;
    requireTime?: string;
    taskDate: Date;
    assignedTo: mongoose.Types.ObjectId | IUser;
    assignedBy: mongoose.Types.ObjectId | IUser;
}

export class Task implements ITask {
    _id?: string;
    taskName: string;
    taskDesp?: string;
    taskStatus: string;
    requireTime?: string;
    taskDate: Date;
    assignedTo: Types.ObjectId | IUser;
    assignedBy: Types.ObjectId | IUser;

    constructor(input: ITask) {
        this._id = input?._id
            ? input?._id.toString()
            : new Types.ObjectId().toString();
        this.taskName = input.taskName;
        this.taskDesp = input.taskDesp;
        this.taskStatus = input.taskStatus;
        this.requireTime = input.requireTime;
        this.taskDate = input.taskDate;
        this.assignedTo = input.assignedTo;
        this.assignedBy = input.assignedBy;
    }

    toJSON(): ITask {
        return omitBy(this, isUndefined) as ITask;
    }
}