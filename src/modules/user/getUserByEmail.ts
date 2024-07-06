import { UserModel } from "./schema";

export const getUserByEmail = async(email:Object) => {
    const user = await UserModel.findOne(email)  
    return user;
}