import { Router } from "express";
import { DataSource } from "typeorm";
import { AuthService } from "../auth.service";
import { AuthController } from "../auth.controller";
import { validateSchema } from "../../common/middlewares/validation.middleware";
import { createUserSchema } from "../../users/validators/user.validators";
import { loginSchema } from "../validator/login.validator";
import { UserService } from "../../users/user.service";

export const authRouter = (dataSource: DataSource) : Router =>{
    const router = Router();
    const userService = new UserService(dataSource);
    const authService = new AuthService(userService);
    const authController = new AuthController(authService);
    

    router.post('/register', validateSchema(createUserSchema), authController.register)
    router.post('/login', validateSchema(loginSchema), authController.login)
    
    return router;
}