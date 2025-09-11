import { RequestHandler, Router } from "express";
import { TicketController } from "../ticket.controller";
import { validateSchema } from "../../common/middlewares/validation.middleware";
import { createTicketSchema, updateTicketSchema } from "../validators/ticket.validators";

export const ticketRouter = (ticketController: TicketController): Router => {
    const router = Router();
    router.get('/', ticketController.allTickets as RequestHandler)
    router.post('/', validateSchema({ body: createTicketSchema }), ticketController.createTicket as RequestHandler)
    router.post('/cancel-ticket', validateSchema({ body: updateTicketSchema }), ticketController.cancelTicket as RequestHandler)

    return router;
}