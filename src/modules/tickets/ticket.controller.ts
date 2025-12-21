import { NextFunction, Request, Response } from "express";
import { TicketService } from "./ticket.service";
import { AuthenticatedRequest } from "../../types/authenticated-request";
import { StatusCodes } from "http-status-codes";

export class TicketController {
    constructor(private ticketService: TicketService) { }

    allTickets = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const allTickets = await this.ticketService.findTickets(userId)
            res.status(StatusCodes.OK).json(allTickets);
            return;
        } catch (error) {
            next(error)
        }
    }

    cancelTicket = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const ticketId = req.params.ticketId;
            const ticketToCancel = await this.ticketService.cancelTicket(userId, ticketId)
            console.log(ticketToCancel, "THIS FROM CONTOLLER");

            res.status(StatusCodes.OK).json(ticketToCancel);
        } catch (error) {
            next(error)
        }

    }

    ticketDetails = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id.toString()!;
            const ticketId = req.params.ticketId!;
            const ticket = await this.ticketService.getTicketDetail(userId, ticketId)
            res.status(200).json(ticket);
        } catch (error) {
            next(error);
        }
    }

}