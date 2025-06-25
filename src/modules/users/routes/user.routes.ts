import { Router } from "express";
import { UserController } from "../controllers/User.controller";
import { UserService } from "../services/user.service";
import { DataSource } from "typeorm";
import { validateSchema } from "../../common/middlewares/validation.middleware";
import { createUserSchema, updatePasswordSchema, updateUserSchema } from "../validators/user.validators";

export const userRouter = (dataSource: DataSource): Router =>{

    const router = Router();
    const userService = new UserService(dataSource)
    const userController = new UserController(userService)
    
    router.post('/', validateSchema(createUserSchema), userController.createUser)
    router.get('/', userController.findAll);
    router.get('/:id', userController.findOneById);
    router.get('/:email', userController.findUserByEmail);
    router.patch('/:id',validateSchema(updateUserSchema), userController.updateUser)
    router.patch('/updatePassword/:id',validateSchema(updatePasswordSchema), userController.updatePassword)
    router.delete('/:id', userController.softRemove)
    return router;
}