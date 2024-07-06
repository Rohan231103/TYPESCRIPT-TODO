import { TaskModel } from "./schema";
import { Task } from "./types"

export const updateTask = async(task: Task) => {
    await TaskModel.findByIdAndUpdate(task._id, task.toJSON());
    return task;
}