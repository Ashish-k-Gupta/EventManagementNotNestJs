import { UserService } from "./user.service";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { InvalidCredentialsException, NotFoundException } from "../common/errors/http.exceptions";
import { EmailService } from "../../common/service/email.service";
export class UserController {
    constructor(private userService: UserService, private emailService: EmailService) { }

    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.userService.createUser(req.body);
            res.status(StatusCodes.CREATED).json(user)
        } catch (err) {
            next(err);
        }
    }

    findAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const allUser = await this.userService.findAll();
            res.status(StatusCodes.OK).json(allUser)
        } catch (err) {
            next(err);
        }
    }


    findUserByEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.params;
            const user = await this.userService.findUserByEmail(email)
            res.status(StatusCodes.OK).json(user);
        } catch (err) {
            next(err);
        }
    }

    findOneById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const user = await this.userService.findOneById(parseInt(id));
            res.status(StatusCodes.OK).json(user)
        } catch (err) {
            next(err);
        }
    }


    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const user = await this.userService.updateUser(parseInt(id), req.body)
            res.status(StatusCodes.OK).json(user)
        } catch (err) {
            next(err);
        }
    }

    updatePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { oldPassword, newPassword } = req.body;
            await this.userService.updatePassword(parseInt(id), { oldPassword, newPassword });
            res.status(StatusCodes.OK).json({ message: "Password Updated Successfully" });
        } catch (err) {
            if (err instanceof NotFoundException || err instanceof InvalidCredentialsException) {
                next(err)
            }
            next(err);
        }
    }

    softRemove = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            await this.userService.softRemove(parseInt(id));
            res.status(StatusCodes.OK).json({ message: "User removed" });
        } catch (err) {
            next(err);
        }
    }

    resetPassword = async(req: Request, res: Response, next: NextFunction) =>{
        try{
            console.log(req.body)
            const {email} = req.body;
            console.log(email)
            await this.userService.resetPassword(email, this.emailService);
            res.status(StatusCodes.OK).json({message:"Reset password link sent."});
        }catch(err){
            next(err)
        }
    }

    confirmResetPassword = async(req: Request, res: Response, next: NextFunction) =>{
        try{
            console.log(req)
            const token = req.query.token as  string;
            const {newPassword} = req.body;
            await this.userService.confirmResetPassword(token, newPassword);
            res.status(StatusCodes.OK).json({message: "Password changed successfully"});
        }catch(err){
            next(err)
        }
    }
}