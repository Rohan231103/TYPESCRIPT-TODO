import { Request, Response } from 'express';
import Joi, { CustomHelpers } from "joi";
import { RoleModel, IRole, deleteRole, getRoleById } from "../../modules/role";

export default class Controller {
    protected readonly uniquePermissions = (permissions: string[], helpers: CustomHelpers) => {
        const permissionSet = new Set(permissions);
        if (permissionSet.size !== permissions.length) {
            return helpers.error('any.duplicate', { value: permissions });
        }
        return permissions;
    }

    protected readonly RoleValidation = Joi.object({
        roleName: Joi.string().required(),
        permissions: Joi.array().items(Joi.string()).custom(this.uniquePermissions, 'unique permissions validation').default([]).required()
    })

    protected readonly rolesArraySchema = Joi.alternatives().try(
        this.RoleValidation,
        Joi.array().items(this.RoleValidation)
    )

    protected readonly addRole = async (req: Request, res: Response) => {
        try {
            const { error } = this.rolesArraySchema.validate(req.body);
            if (error) {
                res.status(400).json({
                    message: error.details[0].message
                });
                return;
            }

            const roles: IRole[] = Array.isArray(req.body) ? req.body : [req.body];

            for (const roleData of roles) {
                const { roleName } = roleData
                const existingRole = await RoleModel.findOne({ roleName });

                if (existingRole) {
                    return res.status(400).json({
                        message: `Role Name "${roleName}" already exists`
                    });
                }
            }

            await RoleModel.insertMany(roles);

            res.status(201).json({
                message: "Role added successfully"
            });

        } catch (error: any) {
            res.status(500).json({
                Error: "Server error",
                message: error.message
            })
        }
    }

    protected readonly updateRole = async (req: Request, res: Response) => {
        try {
            const reqID: string = req.params.roleId;
            const roleID = await getRoleById(reqID) as IRole;

            if (!roleID) {
                return res.status(404).json({
                    message: "Role Not Found",
                });
            }

            const check: string[] = [...new Set<string>(req.body.permissions)];

            const updateObj: Partial<IRole> & { $addToSet?: { permissions: { $each: string[] } } } = {};

            if (req.body.roleName) {
                updateObj.roleName = req.body.roleName;
            }
            if (req.body.permissions && req.body.permissions.length > 0) {
                updateObj.$addToSet = { permissions: { $each: check } };
            }

            const updateDetails = await RoleModel.findByIdAndUpdate(
                { _id: roleID._id },
                updateObj,
                { new: true }
            ) as IRole;

            res.status(200).json({
                message: "Update successfully",
                updateDetails,
            });
        } catch (error: any) {
            res.status(500).json({
                Error: "Server error",
                message: error.message
            })
        }
    }

    protected readonly RemovePermissions = async (req: Request, res: Response) => {
        try {
            const roleID: string = req.params.roleId;
            const permissionToDelete: string[] = req.body.permissions;

            if (!permissionToDelete) {
                res.status(400).json({
                    message: "Permission to delete is required"
                });
                return;
            }

            const role = await getRoleById(roleID) as IRole;

            if (!role) {
                res.status(404).json({
                    message: "Role not found"
                });
                return;
            }

            // Check permission is exist or not
            const rolePermissions: string[] = Array.isArray(role.permissions) ? role.permissions : [];

            const rolePermissionsSet: Set<string> = new Set(rolePermissions);

            const findpermissions: string[] = permissionToDelete.filter(permission => !rolePermissionsSet.has(permission));

            if (findpermissions.length > 0) {
                res.status(400).json({
                    message: "Permission not found"
                });
                return;
            }

            // Use $pull operator to remove the permission from the array
            await RoleModel.findByIdAndUpdate(
                roleID,
                { $pull: { permissions: { $in: permissionToDelete } } },
                { new: true }
            );

            res.status(200).json({
                message: "Permission deleted successfully",
            });
        } catch (error: any) {
            res.status(500).json({
                Error: "Server error",
                message: error.message
            })
        }
    }

    protected readonly deleteRole = async (req: Request, res: Response) => {
        try {
            const roleId: string = req.params.roleId;
            const role = await getRoleById(roleId) as IRole;

            if (!role) {
                return res.status(404).json({
                    message: "Role not found"
                })
            }

            await deleteRole(roleId);

            res.status(200).json({
                message: "Role deleted successfully",
            })
        } catch (error: any) {
            res.status(500).json({
                Error: "Server error",
                message: error.message
            })
        }
    }

    protected readonly getRoles = async (req: Request, res: Response) => {
        try {
            const roles: IRole[] = await RoleModel.find();

            res.status(200).json({
                message: "Roles fetched successfully",
                roles: roles
            })
        } catch (error: any) {
            res.status(500).json({
                Error: "Server error",
                message: error.message
            })
        }
    }
}