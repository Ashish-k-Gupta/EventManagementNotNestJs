import { RequestHandler, Router } from "express";
import { CatergoryController } from "../category.controller";
import { validateSchema } from "../../common/middlewares/validation.middleware";
import { createCategorySchema, updateCategorySchema } from "../validator/category.validator";
import { authorize } from "../../common/middlewares/auth.middleware";
import { USER_ROLE } from "../../users/enums/UserRole.enum";

export const catergoryRouter = (catergoryController: CatergoryController): Router =>{
    const router = Router();

    router.post("/", authorize(USER_ROLE.ADMIN),validateSchema(createCategorySchema), catergoryController.createCategory as RequestHandler)
    router.get("/", catergoryController.findAllCategory)
    router.get("/quick-list/", catergoryController.quickList)
    router.get("/filter/", catergoryController.findCategoryListByIds)
    router.get("/:id", catergoryController.findCategoryById)
    router.put("/:id",  authorize(USER_ROLE.ADMIN),validateSchema(updateCategorySchema), catergoryController.updateCategory)
    router.delete("/:id", authorize(USER_ROLE.ADMIN), catergoryController.softRemove)
    return router;
}

