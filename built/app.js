"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
//import Role from "./controller/role";
const user_1 = __importDefault(require("./controller/user"));
const role_1 = __importDefault(require("./controller/role"));
const task_1 = __importDefault(require("./controller/task"));
//import Task from "./controller/task"
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
class App {
    static start(port) {
        this.instance = (0, express_1.default)();
        this.port = port;
        // Add middleware.
        this.initializeMiddleware();
        // Add controllers
        this.initializeControllers();
    }
    static initializeMiddleware() {
        // Body Parser
        this.instance.use(express_1.default.json());
    }
    static initializeControllers() {
        this.instance.use('/user', new user_1.default().router);
        this.instance.use('/role', new role_1.default().router);
        this.instance.use('/task', new task_1.default().router);
    }
}
exports.default = App;
