import { Router } from "express";
import { UserController } from "../User.controller";
import { validateSchema } from "../../common/middlewares/validation.middleware";
import { confirmResetPasswordSchema, requestNewPasswordSchema, updatePasswordSchema, updateUserSchema,  } from "../validators/user.validators";
import { authenticateJWT, authorize, checkOwnerShipOrAdmin } from "../../common/middlewares/auth.middleware";
import { USER_ROLE } from "../enums/UserRole.enum";

export const userRouter = (userController: UserController): Router => {
    const router = Router();

    // router.post('/', validateSchema(createUserSchema), userController.createUser)
    router.post(
        '/reset-password',
        validateSchema({ body: requestNewPasswordSchema }),
        userController.resetPassword
    )
    router.post(
        '/confirm-reset-password',
        validateSchema({ body: confirmResetPasswordSchema }),
        userController.confirmResetPassword
    )
    router.use(authenticateJWT);
    router.get('/', authorize(USER_ROLE.ADMIN), userController.findAll);
    router.get('/:id', checkOwnerShipOrAdmin, userController.findOneById);
    router.get('/email/:email', checkOwnerShipOrAdmin, userController.findUserByEmail);
    router.patch('/:id', checkOwnerShipOrAdmin, validateSchema({ body: updateUserSchema }), userController.updateUser)
    router.patch('/updatePassword/:id', checkOwnerShipOrAdmin, validateSchema({ body: updatePasswordSchema }), userController.updatePassword)
    router.delete('/:id', authorize(USER_ROLE.ADMIN), userController.softRemove)
    return router;
}