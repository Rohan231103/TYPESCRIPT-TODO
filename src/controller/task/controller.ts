import { Request, Response } from 'express';
import Joi from 'joi';
import { sendMail } from "../../helper/mail"
import { IRole, getRoleById } from '../../modules/role';
import { IUser, getUserById } from '../../modules/user';
import {
    TaskModel,
    ITask,
    deleteTask,
    getTaskById,
    getTaskByQuery,
    updateTask,
    Task
} from '../../modules/task';

export default class Controller {
    protected readonly taskValidation = Joi.object({
        taskName: Joi.string().required(),
        taskDesp: Joi.string().required(),
        assignedTo: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    })

    protected readonly giveTask = async (req: Request, res: Response) => {
        try {
            const { error, value } = this.taskValidation.validate(req.body);

            if (error) {
                return res.status(400).json({
                    message: error.details[0].message
                })
            }

            const { taskName, taskDesp, assignedTo }: { taskName: string, taskDesp: string, assignedTo: string } = value;

            const assign: string = req.body.assignedTo;

            const findUser = await getUserById(assign) as IUser;

            if (!findUser) {
                return res.status(404).json({
                    message: "User not found"
                })
            }

            const existingTask = await TaskModel.findOne({ taskName, assignedTo }) as ITask;

            if (existingTask) {
                return res.status(400).json({
                    message: 'Task with the same name already assigned to the user'
                });
            }

            const newTask: ITask = new TaskModel({
                ...value,
                assignedBy: req.tokenData?.userId
            })

            await TaskModel.create(newTask);

            const msg: string = `Hi ${findUser.name},\n\nYou have been assigned a new task:\n\nTask Name: ${taskName}\nTask Description: ${taskDesp}\n\nBest regards,\nCompany`;

            sendMail({ email: findUser.email, subject: "New Task Assigned", content: msg });

            res.status(201).json({
                message: "Task Assign successfully"
            })
        } catch (error: any) {
            res.status(500).json({
                Error: "Server error: ",
                message: error.message
            })
        }
    }

    protected readonly getAssignTo = async (req: Request, res: Response) => {
        try {
            let tasks: ITask[];

            const userData = await getUserById(req.tokenData?.userId) as IUser;

            if (!userData) {
                return res.status(404).json({
                    message: "User not found"
                })
            }

            const roleData = await getRoleById(userData.role.toString()) as IRole;

            if (!roleData) {
                return res.status(404).json({
                    message: "Role not found"
                })
            }

            if (roleData?.roleName === 'Superadmin') {
                tasks = await getTaskByQuery({})
            }
            else {
                tasks = await getTaskByQuery({ assignedTo: { $in: userData?._id } })
            }

            res.status(200).json({
                message: "Task fetched successfully",
                tasks
            })
        } catch (error: any) {
            res.status(500).json({
                Error: "Server error: ",
                message: error.message
            })
        }
    }

    protected readonly getAssignBy = async (req: Request, res: Response) => {
        try {
            let tasks: ITask[];

            const userData = await getUserById(req.tokenData?.userId) as IUser;

            const roleData = await getRoleById(userData.role.toString()) as IRole;

            if (roleData?.roleName === 'Superadmin') {
                tasks = await getTaskByQuery({});
            }
            else {
                tasks = await getTaskByQuery({ assignedBy: { $in: userData?._id } })
            }

            res.status(200).json({
                message: "Task fetched successfully",
                tasks
            })
        } catch (error: any) {
            res.status(500).json({
                Error: "Server error: ",
                message: error.message
            });
        }
    }

    protected readonly updateTaskAssignBy = async (req: Request, res: Response) => {
        try {
            const taskData: string = req.params.taskId;
            const task = await getTaskById(taskData) as ITask;

            if (!task) {
                return res.status(404).json({
                    message: "Task not found"
                })
            }
            const { taskName, taskDesp, assignedTo }: { taskName: string, taskDesp: string, assignedTo: string } = req.body;

            if (req.tokenData?.userId != task.assignedBy) {
                return res.status(403).json({
                    message: "The Task was not assign by you"
                });
            }

            if (req.tokenData?.userId == req.body.assignedTo) {
                return res.status(403).json({
                    message: "AssignTo id is same as Your id"
                });
            }

            if (req.body.date) {
                return res.status(403).json({
                    message: "Date is Defalut to add"
                })
            }

            if (req.body.status) {
                return res.status(403).json({
                    message: "You are not change the status"
                })
            }

            if (req.body.assignedBy) {
                return res.status(403).json({
                    message: "AssignedBy is Defalut to add"
                })
            }
            let newtask: { taskName?: string, taskDesp?: string, assignedTo?: string } = {};

            if (taskName) {
                newtask.taskName = taskName
            }
            if (taskDesp) {
                newtask.taskDesp = taskDesp
            }
            if (assignedTo) {
                newtask.assignedTo = assignedTo
            }

            await updateTask(new Task({
                ...task,
                ...req.body
            }))

            res.status(200).json({
                message: "Task updated successfully"
            });
        } catch (error: any) {
            res.status(500).json({
                Error: "Server error: ",
                message: error.message
            });
        }
    }

    protected readonly updateTaskByUser = async (req: Request, res: Response) => {
        try {
            const taskData: string = req.params.taskId;
            const task = await getTaskById(taskData) as ITask;

            if (!task) {
                return res.status(404).json({
                    message: "Task not found"
                })
            }

            const { taskStatus, requireTime }: { taskStatus: string, requireTime: string } = req.body;

            if (req.body.taskName) {
                return res.status(403).json({
                    message: "You have not permission to change Task Name"
                });
            }

            if (req.body.taskDesp) {
                return res.status(403).json({
                    message: "You have not permission to change Task Description"
                });
            }

            if (req.body.date) {
                return res.status(403).json({
                    message: "Date is Defalut to add"
                });
            }

            if (req.body.assignedTo) {
                return res.status(403).json({
                    message: "You have not permission to assign Task"
                });
            }

            if (req.body.assignedBy) {
                return res.status(403).json({
                    message: "You have not permission to assign Task"
                });
            }

            let updateStatus: { taskStatus?: string, requireTime?: string } = {};

            if (taskStatus) {
                updateStatus.taskStatus = taskStatus;
            }
            if (requireTime) {
                updateStatus.requireTime = requireTime;
            }

            await updateTask(new Task({
                ...task,
                ...req.body
            }))

            res.status(200).json({
                message: "Task updated successfully"
            });
        } catch (error: any) {
            res.status(500).json({
                Error: "Server error: ",
                message: error.message
            });
        }
    }

    protected readonly deleteTask = async (req: Request, res: Response) => {
        try {
            const taskData: string = req.params.taskId
            const task = await getTaskById(taskData) as ITask;

            if (!task) {
                return res.status(404).json({
                    message: "Task not found"
                })
            }
            if (req.tokenData?.userId !== task.assignedBy.toString()) {
                return res.status(403).json({
                    message: "You do not have permission to delete this task"
                });
            }

            await deleteTask(taskData);

            res.status(200).json({
                message: "Task deleted successfully"
            });

        } catch (error: any) {
            res.status(500).json({
                Error: "Server error: ",
                message: error.message
            });
        }
    }
}

