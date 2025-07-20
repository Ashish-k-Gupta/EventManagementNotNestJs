import { RequestHandler, Router } from "express";
import { TicketController } from "../ticket.controller";
import { validateSchema } from "../../common/middlewares/validation.middleware";
import { createTicketSchema } from "../validators/ticket.validators";

export const ticketRouter = (ticketController: TicketController): Router =>{
    const router = Router();
    router.get('/', ticketController.allTickets as RequestHandler)
    router.post('/', validateSchema(createTicketSchema), ticketController.createTicket as RequestHandler)

    return router;
}