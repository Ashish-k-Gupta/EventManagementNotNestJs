import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";
import { StatusCodes } from "http-status-codes";

export class AuthController {
    constructor(private authService: AuthService) { };
    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const registerUser = await this.authService.registerUser(req.body);
            res.status(StatusCodes.CREATED).json(registerUser)
        } catch (err) {
            next(err);
        }
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(req.body)
            const loginUser = await this.authService.login(req.body);
            res.status(StatusCodes.OK).json(loginUser);
        } catch (err) {
            next(err)
        }
    }
}