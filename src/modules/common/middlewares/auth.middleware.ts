import { NextFunction, Request, Response } from "express"
import { UserRoles, UserRolesArray } from "../../users/enums/UserRole.enum"
import { ForbiddenException, UnauthorizedException } from "../errors/http.exceptions"
import Jwt, {TokenExpiredError, JsonWebTokenError}  from "jsonwebtoken"
import dotenv from 'dotenv'
import { PayloadForToken } from "../../auth/validator/payload.validator"
import { Users } from "../../users/models/Users.entity"


declare module 'express' {
interface Request{
    user?: PayloadForToken;
}
}


dotenv.config();



const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error("JWT_SECRET environment variable is not defined.");
}


export const authenticateJWT = (req: Request, res: Response, next: NextFunction) =>{
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            throw new UnauthorizedException('Authentication token missing or malformed.');
        }

        const token = authHeader.split(' ')[1];
        const decode = Jwt.verify(token, secretKey!) as PayloadForToken;
        req.user = decode;
        next()
    }catch(err){
        if(err instanceof TokenExpiredError){
            next(new UnauthorizedException("Authentication token has expired."));
        }else if(err instanceof JsonWebTokenError){
            next(new UnauthorizedException("Invalid authentication token"));
        }else{
            next(err);
        }
    }
}


export const checkAdmin = (requiredRole: (typeof UserRolesArray)[number]) => (req: Request, res: Response, next: NextFunction) =>{
    try{
        if(!req.user){
            throw new UnauthorizedException("Authentication required. No valid token provided.")
        }
        const userRole: (typeof UserRolesArray)[number] = req.user.role;
        if(userRole === requiredRole){
            next();
        }else{
            throw new ForbiddenException("You do not have permission to access this resource.")
        }
    }catch(err){
        next(err)
    }
}

export const authorize = (requireRole: (typeof UserRolesArray)[number][]) => (req: Request, res: Response, next: NextFunction) =>{
    try{
        if(!req.user){
                 throw new UnauthorizedException("Authentication required. No valid token provided.")
        }
        const userRole: (typeof UserRolesArray)[number] = req.user.role;
        if(requireRole.includes(userRole)){
            next();
        }else{
            throw new ForbiddenException("You do not have permission to access this resource.");
        }
    }catch(err){
        next(err);
    }
}
