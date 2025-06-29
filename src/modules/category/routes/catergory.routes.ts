import { Router } from "express";
import { CatergoryController } from "../category.controller";
import { checkAdmin } from "../../common/middlewares/auth.middleware";
import { UserRoles } from "../../users/enums/UserRole.enum";

export const catergoryRouter = (catergoryController: CatergoryController): Router =>{
    const router = Router();

    router.post("/", checkAdmin(UserRoles.ADMIN), catergoryController.createCategory)
    router.get("/:id", catergoryController.findCategoryById)
    router.get("/:ids", catergoryController.findCategoryListByIds)
    router.get("/", catergoryController.findAllCategory)
    router.put("/", checkAdmin(UserRoles.ADMIN), catergoryController.updateCategory)
    router.delete("/:id",checkAdmin(UserRoles.ADMIN), catergoryController.softRemove)
    return router;
}