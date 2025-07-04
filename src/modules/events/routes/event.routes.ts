import { Router } from "express";
import { EventController } from "../events.controller";
import { validateSchema } from "../../common/middlewares/validation.middleware";
import { CreateEventSchema, updateEventSchema } from "../validators/event.validator";
import { checkAdmin } from "../../common/middlewares/auth.middleware";
import { UserRoles } from "../../users/enums/UserRole.enum";



export const eventRouter = (eventController: EventController): Router =>{
    const router = Router();
    router.post('/',validateSchema(CreateEventSchema), eventController.createEvent);
    router.get('/', eventController.findAllEvents);
    router.get('/quick-list/', eventController.quickListEvent);
    router.get('/:id', eventController.findEventById);
    router.put('/delete/:id',checkAdmin(UserRoles.ADMIN), eventController.softRemove)
    router.put('/:id',validateSchema(updateEventSchema), eventController.updateEvent)
    return router;
}