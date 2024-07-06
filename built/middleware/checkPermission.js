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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermission = void 0;
const user_1 = require("../modules/user");
const role_1 = require("../modules/role");
const checkPermission = (requirePermission) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const findUser = yield user_1.UserModel.findOne({ email: (_a = req.tokenData) === null || _a === void 0 ? void 0 : _a.email });
            const findRole = yield role_1.RoleModel.findById(findUser.role);
            if (findRole.permissions.includes(requirePermission)) {
                next();
            }
            else {
                res.status(403).json({
                    message: "You do not have the necessary permissions"
                });
            }
        }
        catch (error) {
            return res.status(500).json({
                message: "Server error",
                error: error.message
            });
        }
    });
};
exports.checkPermission = checkPermission;
