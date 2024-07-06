import { UserModel } from "./schema"
import { User } from "./types";


export const getUserById = async(_id: string) => {
    const user = await UserModel.findById(_id).lean()

    return user ? new User(user) : null
}