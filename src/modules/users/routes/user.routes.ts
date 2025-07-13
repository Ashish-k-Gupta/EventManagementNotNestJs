import { Router } from "express";
import { UserController } from "../User.controller";
import { validateSchema } from "../../common/middlewares/validation.middleware";
import { updatePasswordSchema, updateUserSchema } from "../validators/user.validators";
import { authenticateJWT, authorize, checkOwnerShipOrAdmin } from "../../common/middlewares/auth.middleware";
import { USER_ROLE } from "../enums/UserRole.enum";

export const userRouter = (userController: UserController): Router => {
    const router = Router();

    // router.post('/', validateSchema(createUserSchema), userController.createUser)
    router.use(authenticateJWT);
    router.get('/', authorize(USER_ROLE.ADMIN), userController.findAll);
    router.get('/:id', checkOwnerShipOrAdmin, userController.findOneById);
    router.get('/email/:email', checkOwnerShipOrAdmin, userController.findUserByEmail);
    router.patch('/:id', checkOwnerShipOrAdmin, validateSchema(updateUserSchema), userController.updateUser)
    router.patch('/updatePassword/:id', checkOwnerShipOrAdmin, validateSchema(updatePasswordSchema), userController.updatePassword)
    router.delete('/:id', authorize(USER_ROLE.ADMIN), userController.softRemove)
    return router;
}