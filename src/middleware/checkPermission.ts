import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserModel , IUser } from "../modules/user";
import { RoleModel , IRole } from "../modules/role";

declare global {
    namespace Express {
        interface Request {
            tokenData?: JwtPayload; 
        }
    }
}

export const checkPermission = (requirePermission: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const findUser: IUser = await UserModel.findOne({ email: req.tokenData?.email }) as IUser;
            const findRole: IRole = await RoleModel.findById(findUser.role) as IRole;

            if (findRole.permissions.includes(requirePermission)) {
                next();
            } else {
                res.status(403).json({
                    message: "You do not have the necessary permissions"
                });
            }
        } catch (error: any) {
            return res.status(500).json({
                message: "Server error",
                error: error.message
            })
        }
    }
}
