import { Router } from "express";
import { checkToken, checkPermission } from "../../middleware";
import Controller from "./controller"

export default class Auth extends Controller {
    public router = Router();
    constructor() {
        super();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post('/giveTask',checkToken,checkPermission("give_task"),this.giveTask);
        this.router.get('/AssignTo',checkToken,checkPermission("get_task"),this.getAssignTo);
        this.router.get('/AssignBy',checkToken,checkPermission("get_task"),this.getAssignBy);
        this.router.patch('/updateTask/:taskId',checkToken,checkPermission("update_task"),this.updateTaskAssignBy);
        this.router.patch('/updateTaskByUser/:taskId',checkToken,checkPermission("update_task_status"),this.updateTaskByUser);
        this.router.delete('/deleteTask/:taskId',checkToken,checkPermission("delete_task"),this.deleteTask);
    }
}