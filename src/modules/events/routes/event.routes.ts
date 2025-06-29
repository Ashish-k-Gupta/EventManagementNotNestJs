import { Router } from "express";
import { DataSource } from "typeorm";
import { EventService } from "../events.service";
import { CategoryService } from "../../category/category.service";
import { EventController } from "../events.controller";
import { validateSchema } from "../../common/middlewares/validation.middleware";
import { CreateEventSchema } from "../validators/event.validator";
import { checkAdmin } from "../../common/middlewares/auth.middleware";
import { UserRoles } from "../../users/enums/UserRole.enum";



export const eventRouter = (eventController: EventController): Router =>{
    const router = Router();
    router.post('/',validateSchema(CreateEventSchema), eventController.createEvent);
    router.get('/:id', eventController.findEventById);
    router.get('/', eventController.findAllEvents);
    router.put('/:id', eventController.updateEvent)
    router.delete('/:id',checkAdmin(UserRoles.ADMIN), eventController.softRemove)
    return router;
}