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
const joi_1 = __importDefault(require("joi"));
const role_1 = require("../../modules/role");
class Controller {
    constructor() {
        this.uniquePermissions = (permissions, helpers) => {
            const permissionSet = new Set(permissions);
            if (permissionSet.size !== permissions.length) {
                return helpers.error('any.duplicate', { value: permissions });
            }
            return permissions;
        };
        this.RoleValidation = joi_1.default.object({
            roleName: joi_1.default.string().required(),
            permissions: joi_1.default.array().items(joi_1.default.string()).custom(this.uniquePermissions, 'unique permissions validation').default([]).required()
        });
        this.rolesArraySchema = joi_1.default.alternatives().try(this.RoleValidation, joi_1.default.array().items(this.RoleValidation));
        // Complete
        this.addRole = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = this.rolesArraySchema.validate(req.body);
                if (error) {
                    res.status(400).json({
                        message: error.details[0].message
                    });
                    return;
                }
                const roles = Array.isArray(req.body) ? req.body : [req.body];
                for (const roleData of roles) {
                    const { roleName } = roleData;
                    const existingRole = yield role_1.RoleModel.findOne({ roleName });
                    if (existingRole) {
                        return res.status(400).json({
                            message: `Role Name "${roleName}" already exists`
                        });
                    }
                }
                yield role_1.RoleModel.insertMany(roles);
                res.status(201).json({
                    message: "Role added successfully"
                });
            }
            catch (error) {
                res.status(500).json({
                    Error: "Server error",
                    message: error.message
                });
            }
        });
        // Only Update
        this.updateRole = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const reqID = req.params.roleId;
                const roleID = yield (0, role_1.getRoleById)(reqID);
                if (!roleID) {
                    return res.status(404).json({
                        message: "Role Not Found",
                    });
                }
                const check = [...new Set(req.body.permissions)];
                const updateObj = {};
                if (req.body.roleName) {
                    updateObj.roleName = req.body.roleName;
                }
                if (req.body.permissions && req.body.permissions.length > 0) {
                    updateObj.$addToSet = { permissions: { $each: check } };
                }
                const updateDetails = yield role_1.RoleModel.findByIdAndUpdate({ _id: roleID._id }, updateObj, { new: true });
                res.status(200).json({
                    message: "Update successfully",
                    updateDetails,
                });
            }
            catch (error) {
                res.status(500).json({
                    Error: "Server error",
                    message: error.message
                });
            }
        });
        // Only Update
        this.RemovePermissions = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const roleID = req.params.roleId;
                const permissionToDelete = req.body.permissions;
                if (!permissionToDelete) {
                    res.status(400).json({
                        message: "Permission to delete is required"
                    });
                    return;
                }
                const role = yield (0, role_1.getRoleById)(roleID);
                if (!role) {
                    res.status(404).json({
                        message: "Role not found"
                    });
                    return;
                }
                // Check permission is exist or not
                const rolePermissions = Array.isArray(role.permissions) ? role.permissions : [];
                const rolePermissionsSet = new Set(rolePermissions);
                const findpermissions = permissionToDelete.filter(permission => !rolePermissionsSet.has(permission));
                if (findpermissions.length > 0) {
                    res.status(400).json({
                        message: "Permission not found"
                    });
                    return;
                }
                // Use $pull operator to remove the permission from the array
                yield role_1.RoleModel.findByIdAndUpdate(roleID, { $pull: { permissions: { $in: permissionToDelete } } }, { new: true });
                res.status(200).json({
                    message: "Permission deleted successfully",
                });
            }
            catch (error) {
                res.status(500).json({
                    Error: "Server error",
                    message: error.message
                });
            }
        });
        // Complete
        this.deleteRole = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const roleId = req.params.roleId;
                const role = yield (0, role_1.getRoleById)(roleId);
                if (!role) {
                    return res.status(404).json({
                        message: "Role not found"
                    });
                }
                yield (0, role_1.deleteRole)(roleId);
                res.status(200).json({
                    message: "Role deleted successfully",
                });
            }
            catch (error) {
                res.status(500).json({
                    Error: "Server error",
                    message: error.message
                });
            }
        });
        //Complete
        this.getRoles = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const roles = yield role_1.RoleModel.find();
                res.status(200).json({
                    message: "Roles fetched successfully",
                    roles: roles
                });
            }
            catch (error) {
                res.status(500).json({
                    Error: "Server error",
                    message: error.message
                });
            }
        });
    }
}
exports.default = Controller;
