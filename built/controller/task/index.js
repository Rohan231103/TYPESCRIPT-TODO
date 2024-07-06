"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const controller_1 = __importDefault(require("./controller"));
class Auth extends controller_1.default {
    constructor() {
        super();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/giveTask', middleware_1.checkToken, (0, middleware_1.checkPermission)("give_task"), this.giveTask);
        this.router.get('/AssignTo', middleware_1.checkToken, (0, middleware_1.checkPermission)("get_task"), this.getAssignTo);
        this.router.get('/AssignBy', middleware_1.checkToken, (0, middleware_1.checkPermission)("get_task"), this.getAssignBy);
        this.router.patch('/updateTask/:taskId', middleware_1.checkToken, (0, middleware_1.checkPermission)("update_task"), this.updateTaskAssignBy);
        this.router.patch('/updateTaskByUser/:taskId', middleware_1.checkToken, (0, middleware_1.checkPermission)("update_task_status"), this.updateTaskByUser);
        this.router.delete('/deleteTask/:taskId', middleware_1.checkToken, (0, middleware_1.checkPermission)("delete_task"), this.deleteTask);
    }
}
exports.default = Auth;
