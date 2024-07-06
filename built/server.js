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
const app_1 = __importDefault(require("./app"));
const dbConnection_1 = require("./dbConnection");
const dotenv = require("dotenv");
dotenv.config();
process.env.TZ = "UTC";
const serverPort = process.env.PORT ? parseInt(process.env.PORT) : 3000;
(0, dbConnection_1.connectDb)()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    app_1.default.start(serverPort);
    app_1.default.instance.listen(serverPort, function () {
        console.info(`App listening on environment "${process.env.NODE_ENV}" ${serverPort}`);
    });
}))
    .catch((error) => {
    console.error("error while connect to database", error);
});
