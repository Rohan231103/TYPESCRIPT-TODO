import mongoose, { Types } from "mongoose";
import { IRole } from "../../role";
import { isUndefined, omitBy } from "lodash";

export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password: string;
    role: mongoose.Types.ObjectId | IRole;
}

export class User implements IUser {
    _id?: string;
    name: string;
    email: string;
    password: string;
    role: mongoose.Types.ObjectId | IRole;


    constructor(input: IUser) {
        this._id = input._id
            ? input._id.toString()
            : new Types.ObjectId().toString();
        this.name = input.name;
        this.email = input.email;
        this.password = input.password;
        this.role = input.role;
        
    }

    toJSON(): IUser {
        return omitBy(this, isUndefined) as IUser;
    }
}