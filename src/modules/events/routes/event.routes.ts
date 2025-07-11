import { RequestHandler, Router } from "express";
import { EventController } from "../events.controller";
import { validateSchema } from "../../common/middlewares/validation.middleware";
import { CreateEventSchema, updateEventSchema } from "../validators/event.validator";
import { checkAdmin } from "../../common/middlewares/auth.middleware";
import { UserRoles } from "../../users/enums/UserRole.enum";



export const eventRouter = (eventController: EventController): Router =>{
    const router = Router();
<<<<<<< Updated upstream
    router.post('/',validateSchema(CreateEventSchema), eventController.createEvent as RequestHandler);
    router.get('/', eventController.getEvents);
    // router.get('/', eventController.findAllEvents);
    router.get('/quick-list', eventController.quickListEvent);
=======
    router.post('/',validateSchema(CreateEventSchema), eventController.createEvent);
    router.get('/', eventController.allEvent);
    // router.get('/', eventController.findAllEvents);
    router.get('/quick-list/', eventController.quickListEvent);
>>>>>>> Stashed changes
    router.get('/:id', eventController.findEventById);
    router.delete('/delete/:id',checkAdmin(UserRoles.ADMIN), eventController.softRemove)
    router.put('/:id',validateSchema(updateEventSchema), eventController.updateEvent)
    return router;
}