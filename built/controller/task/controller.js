"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const mail_1 = require("../../helper/mail");
const role_1 = require("../../modules/role");
const user_1 = require("../../modules/user");
const task_1 = require("../../modules/task");
class Controller {
    constructor() {
        this.taskValidation = joi_1.default.object({
            taskName: joi_1.default.string().required(),
            taskDesp: joi_1.default.string().required(),
            assignedTo: joi_1.default.string().required().regex(/^[0-9a-fA-F]{24}$/),
        });
        // Complete
        this.giveTask = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { error, value } = this.taskValidation.validate(req.body);
                if (error) {
                    return res.status(400).json({
                        message: error.details[0].message
                    });
                }
                const { taskName, taskDesp, assignedTo } = value;
                const assign = req.body.assignedTo;
                const findUser = yield (0, user_1.getUserById)(assign);
                if (!findUser) {
                    return res.status(404).json({
                        message: "User not found"
                    });
                }
                const existingTask = yield task_1.TaskModel.findOne({ taskName, assignedTo });
                if (existingTask) {
                    return res.status(400).json({
                        message: 'Task with the same name already assigned to the user'
                    });
                }
                const newTask = new task_1.TaskModel(Object.assign(Object.assign({}, value), { assignedBy: (_a = req.tokenData) === null || _a === void 0 ? void 0 : _a.userId }));
                yield task_1.TaskModel.create(newTask);
                const msg = `Hi ${findUser.name},\n\nYou have been assigned a new task:\n\nTask Name: ${taskName}\nTask Description: ${taskDesp}\n\nBest regards,\nCompany`;
                (0, mail_1.sendMail)({ email: findUser.email, subject: "New Task Assigned", content: msg });
                res.status(201).json({
                    message: "Task Assign successfully"
                });
            }
            catch (error) {
                res.status(500).json({
                    Error: "Server error: ",
                    message: error.message
                });
            }
        });
        // Complete
        this.getAssignTo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                let tasks;
                const userData = yield (0, user_1.getUserById)((_a = req.tokenData) === null || _a === void 0 ? void 0 : _a.userId);
                if (!userData) {
                    return res.status(404).json({
                        message: "User not found"
                    });
                }
                const roleData = yield (0, role_1.getRoleById)(userData.role.toString());
                if (!roleData) {
                    return res.status(404).json({
                        message: "Role not found"
                    });
                }
                if ((roleData === null || roleData === void 0 ? void 0 : roleData.roleName) === 'Superadmin') {
                    tasks = yield (0, task_1.getTaskByQuery)({});
                }
                else {
                    tasks = yield (0, task_1.getTaskByQuery)({ assignedTo: { $in: userData === null || userData === void 0 ? void 0 : userData._id } });
                }
                res.status(200).json({
                    message: "Task fetched successfully",
                    tasks
                });
            }
            catch (error) {
                res.status(500).json({
                    Error: "Server error: ",
                    message: error.message
                });
            }
        });
        // Complete
        this.getAssignBy = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                let tasks;
                const userData = yield (0, user_1.getUserById)((_a = req.tokenData) === null || _a === void 0 ? void 0 : _a.userId);
                const roleData = yield (0, role_1.getRoleById)(userData.role.toString());
                if ((roleData === null || roleData === void 0 ? void 0 : roleData.roleName) === 'Superadmin') {
                    tasks = yield (0, task_1.getTaskByQuery)({});
                }
                else {
                    tasks = yield (0, task_1.getTaskByQuery)({ assignedBy: { $in: userData === null || userData === void 0 ? void 0 : userData._id } });
                }
                res.status(200).json({
                    message: "Task fetched successfully",
                    tasks
                });
            }
            catch (error) {
                res.status(500).json({
                    Error: "Server error: ",
                    message: error.message
                });
            }
        });
        // Complete
        this.updateTaskAssignBy = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const taskData = req.params.taskId;
                const task = yield (0, task_1.getTaskById)(taskData);
                if (!task) {
                    return res.status(404).json({
                        message: "Task not found"
                    });
                }
                const { taskName, taskDesp, assignedTo } = req.body;
                if (((_a = req.tokenData) === null || _a === void 0 ? void 0 : _a.userId) != task.assignedBy) {
                    return res.status(403).json({
                        message: "The Task was not assign by you"
                    });
                }
                if (((_b = req.tokenData) === null || _b === void 0 ? void 0 : _b.userId) == req.body.assignedTo) {
                    return res.status(403).json({
                        message: "AssignTo id is same as Your id"
                    });
                }
                if (req.body.date) {
                    return res.status(403).json({
                        message: "Date is Defalut to add"
                    });
                }
                if (req.body.status) {
                    return res.status(403).json({
                        message: "You are not change the status"
                    });
                }
                if (req.body.assignedBy) {
                    return res.status(403).json({
                        message: "AssignedBy is Defalut to add"
                    });
                }
                let newtask = {};
                if (taskName) {
                    newtask.taskName = taskName;
                }
                if (taskDesp) {
                    newtask.taskDesp = taskDesp;
                }
                if (assignedTo) {
                    newtask.assignedTo = assignedTo;
                }
                // await TaskModel.findByIdAndUpdate(
                //     taskData,
                //     { $set: newtask },
                //     { new: true }
                // );
                yield (0, task_1.updateTask)(new task_1.Task(Object.assign(Object.assign({}, task), req.body)));
                res.status(200).json({
                    message: "Task updated successfully"
                });
            }
            catch (error) {
                res.status(500).json({
                    Error: "Server error: ",
                    message: error.message
                });
            }
        });
        // Complete
        this.updateTaskByUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const taskData = req.params.taskId;
                const task = yield (0, task_1.getTaskById)(taskData);
                if (!task) {
                    return res.status(404).json({
                        message: "Task not found"
                    });
                }
                const { taskStatus, requireTime } = req.body;
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
                let updateStatus = {};
                if (taskStatus) {
                    updateStatus.taskStatus = taskStatus;
                }
                if (requireTime) {
                    updateStatus.requireTime = requireTime;
                }
                // await TaskModel.findByIdAndUpdate(
                //     taskData,
                //     { $set: updateStatus },
                //     { new: true }
                // );
                yield (0, task_1.updateTask)(new task_1.Task(Object.assign(Object.assign({}, task), req.body)));
                res.status(200).json({
                    message: "Task updated successfully"
                });
            }
            catch (error) {
                res.status(500).json({
                    Error: "Server error: ",
                    message: error.message
                });
            }
        });
        // Complete
        this.deleteTask = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const taskData = req.params.taskId;
                const task = yield (0, task_1.getTaskById)(taskData);
                if (!task) {
                    return res.status(404).json({
                        message: "Task not found"
                    });
                }
                if (((_a = req.tokenData) === null || _a === void 0 ? void 0 : _a.userId) !== task.assignedBy.toString()) {
                    return res.status(403).json({
                        message: "You do not have permission to delete this task"
                    });
                }
                yield (0, task_1.deleteTask)(taskData);
                res.status(200).json({
                    message: "Task deleted successfully"
                });
            }
            catch (error) {
                res.status(500).json({
                    Error: "Server error: ",
                    message: error.message
                });
            }
        });
    }
}
exports.default = Controller;
