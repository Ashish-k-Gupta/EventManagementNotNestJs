import { UserService } from "../services/user.service";
import { Request, Response, NextFunction } from "express";
import { createUserSchema } from "../validators/user.validators";
import { StatusCodes } from "http-status-codes";
export class UserController{
    constructor(private userService: UserService){}

    createUser = async(req: Request, res: Response, next: NextFunction) =>{
        try{
            const validatedData = createUserSchema.parse(req.body);
            const user = await this.userService.createUser(validatedData);
            res.status(StatusCodes.CREATED).json(user)
        }catch(err){
            next(err);
        }
    }

    
    findUserByEmail  = async(req: Request, res: Response, next: NextFunction) =>{
        try{
            const {email} = req.params;
            const user = await this.userService.findUserByEmail(email)
            //This is pending, start from here.
        }catch(err){
            next(err);
        }
    }

    softRemove    = async(req: Request, res: Response, next: NextFunction) =>{
        try{

        }catch(err){
            next(err);
        }
    }

    updateUser  = async(req: Request, res: Response, next: NextFunction) =>{
        try{

        }catch(err){
            next(err);
        }
    }

    updatePassword  = async(req: Request, res: Response, next: NextFunction) =>{
        try{

        }catch(err){
            next(err);
        }
    }

}