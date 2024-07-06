import { Document, Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";
import { IUser } from "../../user"

export interface IRole extends Document {
    roleName: string;
    permissions: string[];
}
