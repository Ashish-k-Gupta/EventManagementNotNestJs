import { NextFunction, Request, Response } from "express";
import { EventService } from "./events.service";
import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "../../types/authenticated-request";

export class EventController{
    constructor(private eventService: EventService){}

    getEvents = async(req: Request, res: Response, next: NextFunction) =>{
        try{
            const term = req.query.term as string;
            const categoryIds = req.query.categoryIds
            ? (Array.isArray(req.query.categoryIds)
             ? req.query.categoryIds  
             : [req.query.categoryIds])
             .map(Number): undefined;
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;
            const result = await this.eventService.getEvent(term, categoryIds, page, limit)
            res.status(StatusCodes.OK).json(result);
        }catch(err){
            next(err);
        }
    }

    createEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) =>{
        try{
            const userId = req.user.id;
            const event = await this.eventService.createEvent(userId, req.body);
            res.status(StatusCodes.CREATED).json(event);
        }catch(err){
            next(err);
        }
    }

    findEventById  = async (req: Request, res: Response, next: NextFunction) =>{
        try{
            const eventId = parseInt(req.params.id, 10);
            const event = await this.eventService.findEventById(eventId);
            res.status(StatusCodes.OK).json(event)
        }catch(err){
            next(err)
        }
    }

    // findAllEvents = async (req: Request, res: Response, next: NextFunction) =>{
    //     try{
    //         const allEvents =await this.eventService.findAllEvents();
    //         res.status(StatusCodes.OK).json(allEvents);
    //     }catch(err){
    //         next(err)
    //     }
    // }

    quickListEvent = async (req: Request, res: Response, next: NextFunction) =>{
        try{
            const allEvents =await this.eventService.quickListEvent();
            res.status(StatusCodes.OK).json(allEvents);
        }catch(err){
            next(err)
        }
    }

    updateEvent = async(req: Request, res: Response, next: NextFunction) =>{
        try{
            const userId = (req as any).user.id;
            const eventId = parseInt(req.params.id, 10);
            const updatedEvent = await this.eventService.updateEvent(userId, eventId, req.body);
            res.status(StatusCodes.OK).json(updatedEvent);
        }catch(err){
            next(err)
        }
    }

    softRemove = async(req: Request, res: Response, next: NextFunction) =>{
        try{
            const eventId  = parseInt(req.params.id, 10);
            const removeEvent = await this.eventService.softRemoveAndCancelled(eventId);
            res.status(StatusCodes.OK).json({message: removeEvent.message});
        }catch(err){
            next(err);
        }
    }

}