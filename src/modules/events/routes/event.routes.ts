import { RequestHandler, Router } from "express";
import { EventController } from "../events.controller";
import { validateSchema } from "../../common/middlewares/validation.middleware";
import { CreateEventSchema, updateEventSchema } from "../validators/event.validator";
import { authorize, checkOwnerShipOrAdmin } from "../../common/middlewares/auth.middleware";
import { USER_ROLE } from "../../users/enums/UserRole.enum";

export const eventRouter = (eventController: EventController): Router => {
    const router = Router();

    router.post('/create-event', validateSchema({ body: CreateEventSchema }), eventController.createEvent as RequestHandler);
    router.get('/', eventController.getEvents as RequestHandler);
    router.get('/quick-list', eventController.quickListEvent);
    router.get('/:id', eventController.findEventById);
    router.get('/event-slot/:slotId', eventController.getSlot); //for single slot by id
    router.get('/event-slots/:id', eventController.getSlots); // for all the slots by eventId
    router.put('/cancel-event/:id', eventController.cancelEvent);
    router.put('/cancel-slot/:id', eventController.cancelSlot);
    router.put('/update/:id', checkOwnerShipOrAdmin, validateSchema({ body: updateEventSchema }), eventController.updateEvent);
    router.delete('/delete/:id', authorize(USER_ROLE.ADMIN), eventController.softRemove)
    return router;
};