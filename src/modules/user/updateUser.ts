import { UserModel } from "./schema";
import { User } from "./types"

export const updateUser = async(user: User) => {
    await UserModel.findByIdAndUpdate(user._id, user.toJSON());
    return user;
}