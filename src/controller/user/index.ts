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
        this.router.post('/addSadmin', this.addSuperAdmin);
        this.router.post('/login', this.login);
        this.router.post('/addUser',checkToken, checkPermission("add_emp"), this.addUser);
        this.router.get('/getUser',checkToken, checkPermission("get_emp"), this.getUser);
        this.router.patch('/updateUser/:userId',checkToken, checkPermission("update_emp"), this.updateUser);
        this.router.delete('/deleteUser/:userId',checkToken, checkPermission("delete_emp"), this.deleteUser);
    }
}