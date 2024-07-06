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
        this.router.post('/addRole',checkToken, checkPermission("add_role"), this.addRole)
        this.router.patch('/updateRole/:roleId',checkToken, checkPermission("update_role"), this.updateRole)
        this.router.delete('/removePermission/:roleId',checkToken, checkPermission("remove_permission"), this.RemovePermissions)
        this.router.delete('/deleteRole/:roleId',checkToken, checkPermission("delete_role"), this.deleteRole);
        this.router.get('/getRole',checkToken, checkPermission("get_role"), this.getRoles);
    }
}