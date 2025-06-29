import { Router } from "express";
import { UserController } from "../User.controller";
import { UserService } from "../user.service";
import { DataSource } from "typeorm";
import { validateSchema } from "../../common/middlewares/validation.middleware";
import { createUserSchema, updatePasswordSchema, updateUserSchema } from "../validators/user.validators";
import { authenticateJWT, checkAdmin } from "../../common/middlewares/auth.middleware";
import { UserRoles } from "../enums/UserRole.enum";

export const userRouter = (userController: UserController): Router => {
    const router = Router();

    // router.post('/', validateSchema(createUserSchema), userController.createUser)
    router.get('/',authenticateJWT, checkAdmin(UserRoles.ADMIN), userController.findAll);
    router.get('/:id', userController.findOneById);
    router.get('/:email', userController.findUserByEmail);
    router.patch('/:id', validateSchema(updateUserSchema), userController.updateUser)
    router.patch('/updatePassword/:id', validateSchema(updatePasswordSchema), userController.updatePassword)
    router.delete('/:id', userController.softRemove)
    return router;
}