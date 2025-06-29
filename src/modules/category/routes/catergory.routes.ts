import { Router } from "express";
import { CatergoryController } from "../category.controller";
import { checkAdmin } from "../../common/middlewares/auth.middleware";
import { UserRoles } from "../../users/enums/UserRole.enum";
import { validateSchema } from "../../common/middlewares/validation.middleware";
import { createCategorySchema, updateCategorySchema } from "../validator/category.validator";

export const catergoryRouter = (catergoryController: CatergoryController): Router =>{
    const router = Router();

    router.post("/", checkAdmin(UserRoles.ADMIN),validateSchema(createCategorySchema), catergoryController.createCategory)
    router.get("/:id", catergoryController.findCategoryById)
    router.get("/:ids", catergoryController.findCategoryListByIds)
    router.get("/", catergoryController.findAllCategory)
    router.put("/", checkAdmin(UserRoles.ADMIN),validateSchema(updateCategorySchema), catergoryController.updateCategory)
    router.delete("/:id",checkAdmin(UserRoles.ADMIN), catergoryController.softRemove)
    return router;
}