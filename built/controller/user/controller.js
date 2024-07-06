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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const joi_1 = __importDefault(require("joi"));
const mongoose_1 = __importDefault(require("mongoose"));
const mail_1 = require("../../helper/mail");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const role_1 = require("../../modules/role");
const user_1 = require("../../modules/user");
//import { Request } from '../../request';
class Controller {
    constructor() {
        this.adminLoginValidation = joi_1.default.object({
            email: joi_1.default.string().email({ tlds: { allow: ['com', 'in'] } }).pattern(/^[^A-Z*/+\-]+@[^A-Z*/+\-]+\.[^A-Z*/+\-]+$/).required(),
            password: joi_1.default.string().min(6).required(),
        });
        this.userValidation = joi_1.default.object({
            name: joi_1.default.string().min(2).required(),
            email: joi_1.default.string().email({ tlds: { allow: ['com', 'in'] } }).pattern(/^[^A-Z*/+\-]+@[^A-Z*/+\-]+\.[^A-Z*/+\-]+$/).required(),
            password: joi_1.default.string().min(6).required(),
            role: joi_1.default.string().custom((value, helpers) => {
                if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
                    return helpers.error('any.invalid');
                }
                return value;
            }).required(),
        });
        this.userUpdateValidation = joi_1.default.object({
            name: joi_1.default.string(),
            email: joi_1.default.string().email({ tlds: { allow: ['com', 'in'] } }).pattern(/^[^A-Z*/+\-]+@[^A-Z*/+\-]+\.[^A-Z*/+\-]+$/),
            password: joi_1.default.string().min(6),
            role: joi_1.default.string().alphanum()
        });
        // protected readonly addSuperAdmin = async (req: Request, res: Response) => {
        //     try {
        //         let superAdminRole = await RoleModel.findOne({ roleName: 'Superadmin' });
        //         if (!superAdminRole) {
        //             superAdminRole = await RoleModel.create({
        //                 roleName: 'Superadmin', permissions: [
        //                     "add_emp",
        //                     "get_emp",
        //                     "update_emp",
        //                     "delete_emp",
        //                     "add_role",
        //                     "update_role",
        //                     "get_role",
        //                     "delete_role",
        //                     "remove_permission",
        //                     "give_task",
        //                     "update_task",
        //                     "get_task",
        //                     "delete_task"
        //                 ]
        //             });
        //         }
        //         let superAdmin = await UserModel.findOne({ email: 'superadmin@gmail.com' });
        //         if (superAdmin) {
        //             res.status(400).json({
        //                 message: "Super Admin already exists"
        //             });
        //         } else {
        //             const hashPassword = await bcrypt.hash('admin@123', 10);
        //             superAdmin = await UserModel.create({ name: 'Super Admin', email: 'superadmin@gmail.com', password: hashPassword, role: superAdminRole._id });
        //             console.log(superAdmin);
        //         }
        //         res.status(201).json({
        //             message: "Super Admin added successfully"
        //         });
        //     } catch (error: any) {
        //         res.status(500).json({
        //             message: error.message
        //         });
        //     }
        // }
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = this.adminLoginValidation.validate(req.body);
                if (error) {
                    res.status(400).json({
                        message: error.details[0].message
                    });
                    return;
                }
                const { email, password } = req.body;
                const superAdmin = yield (0, user_1.getUserByEmail)({ email });
                if (!superAdmin) {
                    res.status(400).json({
                        message: "Admin not found"
                    });
                    return;
                }
                const isMatch = yield bcrypt_1.default.compare(password, superAdmin.password);
                if (!isMatch) {
                    res.status(400).json({
                        message: "Invalid Credential"
                    });
                    return;
                }
                const token = jsonwebtoken_1.default.sign({
                    userId: superAdmin._id,
                    email: superAdmin.email,
                    expiresIn: '24h'
                }, process.env.SECRET_KEY || '');
                res.header('Authorization', `${token}`);
                res.status(200).json({
                    message: "Admin logged in successfully",
                    //token: token 
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
        this.addUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = this.userValidation.validate(req.body);
                if (error) {
                    return res.status(400).json({
                        message: error.details[0].message
                    });
                }
                const { name, email, password, role } = req.body;
                const getrole = yield (0, role_1.getRoleById)(role);
                if (!getrole) {
                    return res.status(404).json({
                        message: "Role not found"
                    });
                }
                // const emp: IUser = await UserModel.findOne({ email }) as IUser;
                const user = yield (0, user_1.getUserByEmail)({ email });
                if (user) {
                    return res.status(400).json({
                        message: "Email already exists"
                    });
                }
                const hashPassword = yield bcrypt_1.default.hash(password, 10);
                yield user_1.UserModel.create({
                    name: name,
                    email: email,
                    password: hashPassword,
                    role: role
                });
                const msg = `Hi ${name},\n\nYou have been added as a ${getrole.roleName}. Your login credentials are:\n\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after logging in.\n\nBest regards,\nCompany`;
                (0, mail_1.sendMail)({ email, subject: "Welcome to the Company", content: msg });
                res.status(201).json({
                    message: "Employee added successfully"
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
        this.getUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tokenDetails = yield (0, user_1.getUserById)((_a = req.tokenData) === null || _a === void 0 ? void 0 : _a.userId);
                if (!tokenDetails) {
                    return res.status(404).json({ message: "User not found" });
                }
                const tokenRole = yield (0, role_1.getRoleById)(tokenDetails.role.toString());
                if (!tokenRole) {
                    return res.status(404).json({ message: "Role not found" });
                }
                let getUserData = [];
                if (tokenRole.roleName === 'Superadmin') {
                    getUserData = yield (0, user_1.getUserByQuery)({});
                }
                else if (tokenRole.roleName === 'Admin') {
                    const getAllUser = yield (0, user_1.getUserByQuery)({});
                    getUserData = getAllUser.filter(user => user.role.roleName === 'Employee');
                }
                res.status(200).json({
                    getUserData
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
        this.updateUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { error, value } = this.userUpdateValidation.validate(req.body);
                if (error) {
                    return res.status(400).json({
                        message: error.details[0].message
                    });
                }
                const { name, email, password, role } = value;
                const newPassword = req.body.password;
                const UserId = req.params.userId;
                const user = yield (0, user_1.getUserById)(UserId);
                if (!user) {
                    return res.status(404).json({
                        message: "Employee not found"
                    });
                }
                let newMail;
                if (email) {
                    newMail = email;
                }
                else {
                    newMail = user.email;
                }
                let roleName;
                if (role) {
                    const roleDetails = yield (0, role_1.getRoleById)(role);
                    if (!roleDetails) {
                        return res.status(404).json({
                            message: "Role not found"
                        });
                    }
                    roleName = roleDetails.roleName;
                }
                const updateObj = {};
                if (req.body.name) {
                    updateObj.name = req.body.name;
                }
                if (req.body.email) {
                    updateObj.email = req.body.email;
                }
                if (req.body.password) {
                    // const password: string = req.body.password;
                    req.body.password = yield bcrypt_1.default.hash(req.body.password, 10);
                    updateObj.password = req.body.password;
                }
                if (req.body.role) {
                    updateObj.role = req.body.role;
                }
                const isMatch = yield bcrypt_1.default.compare(password, user.password);
                if (isMatch) {
                    return res.status(400).json({
                        message: "Your Old password And new password are same Please try new password again"
                    });
                }
                if (value.name) {
                    if (value.name === user.name) {
                        return res.status(400).json({
                            message: "New Name cannot be the same as old Name",
                        });
                    }
                }
                if (value.email) {
                    if (value.email === user.email) {
                        return res.status(400).json({
                            message: "New Email cannot be the same as old Email",
                        });
                    }
                }
                yield (0, user_1.updateUser)(new user_1.User(Object.assign(Object.assign(Object.assign({}, user), value), { password: req.body.password })));
                let update = '';
                for (const key in updateObj) {
                    if (key === 'role') {
                        update += `Role: ${roleName}\n`;
                    }
                    else if (key === 'password') {
                        update += `New Password: ${newPassword}\n`;
                    }
                    else {
                        update += `${key}: ${updateObj[key]}\n`;
                    }
                }
                const msg = `Hi ${name || user.name},\n\nYour details have been updated as follows:\n\n${update}\n\nBest regards,\nCompany`;
                (0, mail_1.sendMail)({ email: newMail, subject: "Your Details Have Been Updated", content: msg });
                res.status(200).json({
                    message: "Employee updated successfully",
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
        this.deleteUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const UserId = req.params.userId;
                const user = yield (0, user_1.getUserById)(UserId);
                if (!user) {
                    return res.status(404).json({
                        message: "Employee not found"
                    });
                }
                yield (0, user_1.deleteUser)(UserId);
                res.status(200).json({
                    message: "Employee deleted successfully"
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
