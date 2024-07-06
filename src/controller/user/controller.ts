import { Request, Response, query } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import mongoose from "mongoose";
import { sendMail } from "../../helper/mail"
import dotenv from "dotenv";
dotenv.config();
import { RoleModel, IRole, getRoleById } from '../../modules/role';
import {
    UserModel,
    IUser,
    getUserById,
    getUserByQuery,
    getUserByEmail,
    deleteUser,
    updateUser,
    User
} from '../../modules/user';


export default class Controller {
    protected readonly adminLoginValidation = Joi.object({
        email: Joi.string().email({ tlds: { allow: ['com', 'in'] } }).pattern(/^[^A-Z*/+\-]+@[^A-Z*/+\-]+\.[^A-Z*/+\-]+$/).required(),
        password: Joi.string().min(6).required(),
    })

    protected readonly userValidation = Joi.object({
        name: Joi.string().min(2).required(),
        email: Joi.string().email({ tlds: { allow: ['com', 'in'] } }).pattern(/^[^A-Z*/+\-]+@[^A-Z*/+\-]+\.[^A-Z*/+\-]+$/).required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('any.invalid');
            }
            return value;
        }).required(),
    })

    protected readonly userUpdateValidation = Joi.object({
        name: Joi.string(),
        email: Joi.string().email({ tlds: { allow: ['com', 'in'] } }).pattern(/^[^A-Z*/+\-]+@[^A-Z*/+\-]+\.[^A-Z*/+\-]+$/),
        password: Joi.string().min(6),
        role: Joi.string().alphanum()
    })

    protected readonly addSuperAdmin = async (req: Request, res: Response) => {
        try {
            let superAdminRole = await RoleModel.findOne({ roleName: 'Superadmin' });

            if (!superAdminRole) {
                superAdminRole = await RoleModel.create({
                    roleName: 'Superadmin', permissions: [
                        "add_emp",
                        "get_emp",
                        "update_emp",
                        "delete_emp",
                        "add_role",
                        "update_role",
                        "get_role",
                        "delete_role",
                        "remove_permission",
                        "give_task",
                        "update_task",
                        "get_task",
                        "delete_task"
                    ]
                });
            }

            let superAdmin = await UserModel.findOne({ email: 'superadmin@gmail.com' });
            if (superAdmin) {
                res.status(400).json({
                    message: "Super Admin already exists"
                });
            } else {
                const hashPassword = await bcrypt.hash('admin@123', 10);

                superAdmin = await UserModel.create({ name: 'Super Admin', email: 'superadmin@gmail.com', password: hashPassword, role: superAdminRole._id });
                console.log(superAdmin);
            }

            res.status(201).json({
                message: "Super Admin added successfully"
            });
        } catch (error: any) {
            res.status(500).json({
                message: error.message
            });
        }
    }


    protected readonly login = async (req: Request, res: Response) => {
        try {
            const { error } = this.adminLoginValidation.validate(req.body);
            if (error) {
                res.status(400).json({
                    message: error.details[0].message
                });
                return;
            }

            const { email, password }: { email: string, password: string } = req.body;

            const superAdmin = await getUserByEmail({ email }) as IUser;

            if (!superAdmin) {
                res.status(400).json({
                    message: "Admin not found"
                });
                return;
            }

            const isMatch: boolean = await bcrypt.compare(password, superAdmin.password);

            if (!isMatch) {
                res.status(400).json({
                    message: "Invalid Credential"
                });
                return;
            }

            const token: string = jwt.sign({
                userId: superAdmin._id,
                email: superAdmin.email,
                expiresIn: '24h'
            },
                process.env.SECRET_KEY || ''
            );

            res.header('Authorization', `${token}`);

            res.status(200).json({
                message: "Admin logged in successfully",
                //token: token 
            });

        } catch (error: any) {
            res.status(500).json({
                Error: "Server error",
                message: error.message
            });
        }
    }

    protected readonly addUser = async (req: Request, res: Response) => {
        try {
            const { error } = this.userValidation.validate(req.body);

            if (error) {
                return res.status(400).json({
                    message: error.details[0].message
                })
            }

            const { name, email, password, role }: { name: string, email: string, password: string, role: string } = req.body;

            const getrole = await getRoleById(role) as IRole;
            if (!getrole) {
                return res.status(404).json({
                    message: "Role not found"
                })
            }

            const user = await getUserByEmail({ email }) as IUser;

            if (user) {
                return res.status(400).json({
                    message: "Email already exists"
                })
            }

            const hashPassword: string = await bcrypt.hash(password, 10);

            await UserModel.create({
                name: name,
                email: email,
                password: hashPassword,
                role: role
            })

            const msg: string = `Hi ${name},\n\nYou have been added as a ${getrole.roleName}. Your login credentials are:\n\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after logging in.\n\nBest regards,\nCompany`


            sendMail({ email, subject: "Welcome to the Company", content: msg });

            res.status(201).json({
                message: "Employee added successfully"
            })

        } catch (error: any) {
            res.status(500).json({
                Error: "Server error",
                message: error.message
            });
        }
    }

    protected readonly getUser = async (req: Request, res: Response) => {
        try {
            const tokenDetails = await getUserById(req.tokenData?.userId) as IUser;

            if (!tokenDetails) {
                return res.status(404).json({ message: "User not found" });
            }

            const tokenRole = await getRoleById(tokenDetails.role.toString()) as IRole;

            if (!tokenRole) {
                return res.status(404).json({ message: "Role not found" });
            }

            let getUserData: IUser[] = [];


            if (tokenRole.roleName === 'Superadmin') {
                getUserData = await getUserByQuery({})

            } else if (tokenRole.roleName === 'Admin') {
                const getAllUser: IUser[] = await getUserByQuery({})
                getUserData = getAllUser.filter(user => (user.role as IRole).roleName === 'Employee');
            }


            res.status(200).json({
                getUserData
            });
        } catch (error: any) {
            res.status(500).json({
                Error: "Server error",
                message: error.message
            });
        }
    }

    protected readonly updateUser = async (req: Request, res: Response) => {
        try {
            const { error, value } = this.userUpdateValidation.validate(req.body);
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message
                })
            }

            const { name, email, password, role } = value;
            const newPassword: string = req.body.password;


            const UserId: string = req.params.userId;


            const user = await getUserById(UserId);

            if (!user) {
                return res.status(404).json({
                    message: "Employee not found"
                });
            }

            let newMail: string;

            if (email) {
                newMail = email
            } else {
                newMail = user.email;
            }

            let roleName: string | undefined;
            if (role) {
                const roleDetails = await getRoleById(role);
                if (!roleDetails) {
                    return res.status(404).json({
                        message: "Role not found"
                    })
                }
                roleName = roleDetails.roleName;
            }

            const updateObj: Partial<IUser> = {};

            if (req.body.name) {
                updateObj.name = req.body.name;
            }
            if (req.body.email) {
                updateObj.email = req.body.email;
            }
            if (req.body.password) {
                req.body.password = await bcrypt.hash(req.body.password, 10);
                updateObj.password = req.body.password;
            }
            if (req.body.role) {
                updateObj.role = req.body.role;
            }

            const isMatch: boolean = await bcrypt.compare(password, user.password);
            if (isMatch) {
                return res.status(400).json({
                    message: "Your Old password And new password are same Please try new password again"
                })
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

            await updateUser(new User({
                ...user,
                ...value,
                password: req.body.password
            }))
            let update: string = '';

            for (const key in updateObj) {
                if (key === 'role') {
                    update += `Role: ${roleName}\n`
                }
                else if (key === 'password') {
                    update += `New Password: ${newPassword}\n`
                }
                else {
                    update += `${key}: ${updateObj[key as keyof IUser]}\n`
                }
            }


            const msg: string = `Hi ${name || user.name},\n\nYour details have been updated as follows:\n\n${update}\n\nBest regards,\nCompany`;

            sendMail({ email: newMail, subject: "Your Details Have Been Updated", content: msg });

            res.status(200).json({
                message: "Employee updated successfully",
            })
        } catch (error: any) {
            res.status(500).json({
                Error: "Server error",
                message: error.message
            });
        }
    }

    protected readonly deleteUser = async (req: Request, res: Response) => {
        try {
            const UserId: string = req.params.userId;
            const user = await getUserById(UserId) as IUser;

            if (!user) {
                return res.status(404).json({
                    message: "Employee not found"
                })
            }

            await deleteUser(UserId);

            res.status(200).json({
                message: "Employee deleted successfully"
            })
        } catch (error: any) {
            res.status(500).json({
                Error: "Server error",
                message: error.message
            });
        }
    }
}