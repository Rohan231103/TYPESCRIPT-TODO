"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleModel = void 0;
const mongoose_1 = require("mongoose");
const role = new mongoose_1.Schema({
    roleName: {
        type: String,
        required: true,
        unique: true
    },
    permissions: {
        type: [String],
        required: true
    }
});
exports.RoleModel = (0, mongoose_1.model)("role", role);
