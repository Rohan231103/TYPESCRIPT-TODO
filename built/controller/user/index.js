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
        this.router.post('/addSadmin', this.addSuperAdmin);
        this.router.post('/login', this.login);
        this.router.post('/addUser', middleware_1.checkToken, (0, middleware_1.checkPermission)("add_emp"), this.addUser);
        this.router.get('/getUser', middleware_1.checkToken, (0, middleware_1.checkPermission)("get_emp"), this.getUser);
        this.router.patch('/updateUser/:userId', middleware_1.checkToken, (0, middleware_1.checkPermission)("update_emp"), this.updateUser);
        this.router.delete('/deleteUser/:userId', middleware_1.checkToken, (0, middleware_1.checkPermission)("delete_emp"), this.deleteUser);
    }
}
exports.default = Auth;
