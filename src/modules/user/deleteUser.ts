import { UserModel } from "./schema";

export const deleteUser = async(_id:string) => {
    await UserModel.findByIdAndDelete(_id);
    return;
}