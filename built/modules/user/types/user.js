"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const lodash_1 = require("lodash");
class User {
    constructor(input) {
        this._id = input._id
            ? input._id.toString()
            : new mongoose_1.Types.ObjectId().toString();
        this.name = input.name;
        this.email = input.email;
        this.password = input.password;
        this.role = input.role;
    }
    toJSON() {
        return (0, lodash_1.omitBy)(this, lodash_1.isUndefined);
    }
}
exports.User = User;
