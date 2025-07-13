import { NextFunction, Request, Response } from "express"
import { USER_ROLE } from "../../users/enums/UserRole.enum"
import { ForbiddenException, UnauthorizedException } from "../errors/http.exceptions"
import Jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken"
import dotenv from 'dotenv'
import { PayloadForToken } from "../../auth/validator/payload.validator"


declare module 'express' {
    interface Request {
        user?: PayloadForToken;
    }
}


dotenv.config();



const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
    throw new Error("JWT_SECRET environment variable is not defined.");
}


export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Authentication token missing or malformed.');
        }

        const token = authHeader.split(' ')[1];
        const decode = Jwt.verify(token, secretKey!) as PayloadForToken;
        req.user = decode;
        next()
    } catch (err) {
        if (err instanceof TokenExpiredError) {
            next(new UnauthorizedException("Authentication token has expired."));
        } else if (err instanceof JsonWebTokenError) {
            next(new UnauthorizedException("Invalid authentication token"));
        } else {
            next(err);
        }
    }
}


export const checkOwnerShipOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {

        if (!req.user || req.user.id === null || req.user.id === undefined || !req.user.role) {
            throw new UnauthorizedException("Authentication required. No valid token provided.")
        }

        const resourceId = parseInt(req.params.id, 10);
        if (isNaN(resourceId)) {
            throw new ForbiddenException('Invalid resource ID in the URL')
        }

        const authenticatedUserId = req.user.id;
        const userRole = req.user.role;


        if (resourceId === authenticatedUserId || userRole === USER_ROLE.ADMIN) {
            next();
        } else {
            throw new ForbiddenException("You do not have permission to access this resource.")
        }
    } catch (err) {
        next(err)
    }
}

export const authorize = (requireRole: (typeof USER_ROLE)[keyof typeof USER_ROLE]) => (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedException("Authentication required. No valid token provided.")
        }
        const userRole: (typeof USER_ROLE)[keyof typeof USER_ROLE] = req.user.role;
        if (requireRole.includes(userRole)) {
            next();
        } else {
            throw new ForbiddenException("You do not have permission to access this resource.");
        }
    } catch (err) {
        next(err);
    }
}

export const checkOwnership = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            throw new UnauthorizedException("Authentication required. User ID not found in token.");
        }

        const resourceId = parseInt(req.params.id, 10);
        if (isNaN(resourceId)) {
            throw new ForbiddenException("Invalid resource ID in URL.");
        }
        const authenticatedUserId = req.user.id;


        if (resourceId === authenticatedUserId) {
            next()
        } else {
            throw new ForbiddenException("Access denied. You are not authorzide to access this.");
        }

    } catch(err){
        next(err)
    }
}