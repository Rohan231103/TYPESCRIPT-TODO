import { RoleModel } from "./schema"

export const getRoleById = async(_id: string) => {
    const role = await RoleModel.findById(_id).lean();
    return role;
}
