"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = require("mongoose");
const lodash_1 = require("lodash");
class Task {
    constructor(input) {
        this._id = (input === null || input === void 0 ? void 0 : input._id)
            ? input === null || input === void 0 ? void 0 : input._id.toString()
            : new mongoose_1.Types.ObjectId().toString();
        this.taskName = input.taskName;
        this.taskDesp = input.taskDesp;
        this.taskStatus = input.taskStatus;
        this.requireTime = input.requireTime;
        this.taskDate = input.taskDate;
        this.assignedTo = input.assignedTo;
        this.assignedBy = input.assignedBy;
    }
    toJSON() {
        return (0, lodash_1.omitBy)(this, lodash_1.isUndefined);
    }
}
exports.Task = Task;
