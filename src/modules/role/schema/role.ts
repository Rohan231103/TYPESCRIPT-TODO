import { Schema, model } from "mongoose";
import { IRole } from "../types";

const role = new Schema<IRole>(
    {
        roleName: {
            type: String,
            required: true,
            unique: true
        },
        permissions: {
            type: [String],
            required: true
        }
    }
);
export const RoleModel = model<IRole>("role", role)