import express from 'express';
import User from "./controller/user";
import Role from "./controller/role";
import Task from "./controller/task"


const port = process.env.PORT ? parseInt(process.env.PORT  ) : 3000
export default class App {
    public static instance: express.Application;
    private static port: number;
    public static start(port: number ) {
        this.instance = express();
        this.port = port;

        // Add middleware.
        this.initializeMiddleware();

        // Add controllers
        this.initializeControllers();
    }

    private static initializeMiddleware() {
        // Body Parser
        this.instance.use(express.json());
    }

    private static initializeControllers() {
        this.instance.use('/user', new User().router);
        this.instance.use('/role', new Role().router);
        this.instance.use('/task', new Task().router);
    }
}