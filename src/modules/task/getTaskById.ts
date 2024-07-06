import { TaskModel } from "./schema"


export const getTaskById = async(_id: string) => {
    const task = await TaskModel.findById(_id).lean();
    return task;
}

