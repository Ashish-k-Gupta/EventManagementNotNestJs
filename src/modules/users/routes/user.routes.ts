import { Router } from "express";
import { UserController } from "../controllers/User.controller";
import { UserService } from "../services/user.service";
import { DataSource } from "typeorm";
import { validateSchema } from "../../common/middlewares/validation.middleware";
import { updatePasswordSchema } from "../validators/user.validators";

export const userRouter = (dataSource: DataSource): Router =>{

    const router = Router();
    const userService = new UserService(dataSource)
    const userController = new UserController(userService)
    
    router.get('/', userController.findAll);
    router.post('/', userController.createUser)
    router.patch('/:id', userController.updateUser)
    router.patch('/updatePassword/:id',validateSchema(updatePasswordSchema), userController.updatePassword)

    return router;
}