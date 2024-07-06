import { TaskModel } from "./schema";

export const deleteTask = async(_id:string) => {
    await TaskModel.findByIdAndDelete(_id);
    return;
}