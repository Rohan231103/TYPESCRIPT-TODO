import { RoleModel } from "./schema";

export const deleteRole = async(_id:string) => {
    await RoleModel.findByIdAndDelete(_id);
    return;
}