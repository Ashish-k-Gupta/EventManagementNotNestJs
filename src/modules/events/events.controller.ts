import { NextFunction, Request, Response } from "express";
import { EventService } from "./events.service";
import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "../../types/authenticated-request";
import { EventQueryParams, EventQueryParamsSchema } from "../../common/validation/eventQuerySchema";
import z from 'zod';

export class EventController {
    constructor(private eventService: EventService) { }

    getEvents = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validateQueryParams: EventQueryParams = EventQueryParamsSchema.parse(req.query);
            const result = await this.eventService.getEvent(validateQueryParams);
            res.status(StatusCodes.OK).json(result);
        } catch (err) {
            if (err instanceof z.ZodError) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Validation error in query parameters",
                    errors: err.errors
                });
            }
            next(err);
        }
    }



    createEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const event = await this.eventService.createEvent(userId, req.body);
            res.status(StatusCodes.CREATED).json(event);
        } catch (err) {
            next(err);
        }
    }

    findEventById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const eventId = parseInt(req.params.id, 10);
            const event = await this.eventService.findEventById(eventId);
            res.status(StatusCodes.OK).json(event)
        } catch (err) {
            next(err)
        }
    }

    getSlots = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const eventId = parseInt(req.params.id, 10);
            const eventSlots = await this.eventService.getEventSlots(eventId);
            console.log("slots here", eventSlots)
            res.status(StatusCodes.OK).json(eventSlots)
        } catch (err) {
            next(err)
        }
    }

    getSlot = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const slotId = parseInt(req.params.slotId, 10);
            const slot = await this.eventService.getSlotById(slotId);
            res.status(StatusCodes.OK).json(slot);
            console.log(slot);
        } catch (err) {
            next(err);
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

    quickListEvent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const allEvents = await this.eventService.quickListEvent();
            res.status(StatusCodes.OK).json(allEvents);
        } catch (err) {
            next(err)
        }
    }

    updateEvent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.id;
            const eventId = parseInt(req.params.id, 10);
            const updatedEvent = await this.eventService.updateEvent(userId, eventId, req.body);
            res.status(StatusCodes.OK).json(updatedEvent);
        } catch (err) {
            next(err)
        }
    }

    cancelEvent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const eventId = parseInt(req.params.id);
            const cancelEvent = await this.eventService.cancelEvent(eventId)
            res.status(StatusCodes.OK).json(cancelEvent)
        } catch (err) {
            next(err)
        }
    }

    cancelSlot = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const slotId = parseInt(req.params.id)
            const cancelSlot = await this.eventService.cancelEventSlot(slotId)
            res.status(StatusCodes.OK).json(cancelSlot)
        } catch (err) {
            next(err)
        }
    }

    softRemove = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const eventId = parseInt(req.params.id);
            const removeEvent = await this.eventService.softRemoveAndCancelled(eventId);
            res.status(StatusCodes.OK).json({ message: removeEvent.message });
        } catch (err) {
            next(err);
        }
    }

}