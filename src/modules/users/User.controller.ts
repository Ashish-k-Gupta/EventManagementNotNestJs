import { UserService } from "./user.service";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { InvalidCredentialsException, NotFoundException } from "../common/errors/http.exceptions";
export class UserController {
    constructor(private userService: UserService) { }

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
            console.error("An unexpected error occurred:", err);
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
}