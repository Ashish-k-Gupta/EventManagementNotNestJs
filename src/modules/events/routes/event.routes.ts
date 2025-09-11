import { RequestHandler, Router } from "express";
import { EventController } from "../events.controller";
import { validateSchema } from "../../common/middlewares/validation.middleware";
import { CreateEventSchema, updateEventSchema } from "../validators/event.validator";
import { authorize, checkOwnerShipOrAdmin } from "../../common/middlewares/auth.middleware";
import { USER_ROLE } from "../../users/enums/UserRole.enum";

export const eventRouter = (eventController: EventController): Router => {
    const router = Router();

    // Corrected: Pass the schema within a { body: ... } object
    router.post('/create-event', validateSchema({ body: CreateEventSchema }), eventController.createEvent as RequestHandler);

    router.get('/', eventController.getEvents as RequestHandler);
    router.get('/quick-list', eventController.quickListEvent);
    router.get('/:id', eventController.findEventById);

    // Corrected: Pass the schema within a { body: ... } object
    // router.put('/:id', checkOwnerShipOrAdmin, validateSchema({ body: updateEventSchema }), eventController.updateEvent);

    // router.delete('/delete/:id', authorize(USER_ROLE.ADMIN), eventController.softRemove)

    return router;
};