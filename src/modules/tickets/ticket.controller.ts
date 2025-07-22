import { NextFunction, Request, Response } from "express";
import { TicketService } from "./ticket.service";
import { AuthenticatedRequest } from "../../types/authenticated-request";
import { StatusCodes } from "http-status-codes";

export class TicketController{
    constructor(private ticketService: TicketService){}

    allTickets = async(req: AuthenticatedRequest, res: Response, next: NextFunction) =>{
        try{
            const allTickets =await this.ticketService.findTickets(req.user.id)
            res.status(StatusCodes.OK).json(allTickets);
        }catch(error){
            next(error)
        }
    }

    createTicket = async(req: AuthenticatedRequest, res: Response, next: NextFunction) =>{
        try{
            const usreId = req.user.id;
            const tickets =  this.ticketService.createTicket(usreId, req.body);
            res.status(StatusCodes.CREATED).json(tickets)

        }catch(error){
            next(error);
        }
    }

    cancelTicket = async(req: AuthenticatedRequest, res: Response, next: NextFunction) =>{
        try{
            const userId = req.user.id;
            const ticketToCancel = await this.ticketService.cancelTickets(userId, req.body);
            res.status(StatusCodes.OK).json(ticketToCancel);
        }catch(error){
            next(error)
        }
    }

}