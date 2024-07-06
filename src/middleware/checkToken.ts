import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserModel , IUser } from "../modules/user";

declare global {
    namespace Express {
        interface Request {
            tokenData?: JwtPayload; 
        }
    }
}

export const checkToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader: string = req.headers['authorization'] as string;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authorization Token is missing"
            });
        }

        const decode: JwtPayload | string = jwt.verify(authHeader, process.env.SECRET_KEY as string);

        req.tokenData = decode as JwtPayload;

        const user = await UserModel.findById(req.tokenData.userId) as IUser;

        if (!user) {
            return res.status(400).json({
                message: 'User not found'
            });
        }

        next();
    } catch (error: any) {
        res.status(500).json({
            message: error.message
        });
    }
}