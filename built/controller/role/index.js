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
        this.router.post('/addRole', middleware_1.checkToken, (0, middleware_1.checkPermission)("add_role"), this.addRole);
        this.router.patch('/updateRole/:roleId', middleware_1.checkToken, (0, middleware_1.checkPermission)("update_role"), this.updateRole);
        this.router.delete('/removePermission/:roleId', middleware_1.checkToken, (0, middleware_1.checkPermission)("remove_permission"), this.RemovePermissions);
        this.router.delete('/deleteRole/:roleId', middleware_1.checkToken, (0, middleware_1.checkPermission)("delete_role"), this.deleteRole);
        this.router.get('/getRole', middleware_1.checkToken, (0, middleware_1.checkPermission)("get_role"), this.getRoles);
    }
}
exports.default = Auth;
