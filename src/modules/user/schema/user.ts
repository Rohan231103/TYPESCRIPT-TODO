import mongoose, { Schema, model, Types } from 'mongoose';
import {IUser} from "../types"

const user = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'role', // Assuming 'Role' is the name of your Role model
            required: true
        }
    });

export const UserModel = model<IUser>("user", user)