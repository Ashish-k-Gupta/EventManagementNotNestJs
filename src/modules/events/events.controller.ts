import { NextFunction, Request, Response } from "express";
import { EventService } from "./events.service";
import { StatusCodes } from "http-status-codes";
<<<<<<< Updated upstream
import { AuthenticatedRequest } from "../../types/authenticated-request";
=======
import { number } from "zod";
>>>>>>> Stashed changes

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
    allEvent = async (req: Request, res: Response, next: NextFunction) =>{
        try{
           const {term, categoryIds, page , limit} = req.query as { term?: string; categoryIds?: string | string[]; page?: string; limit?: string};

           let parsedCategoryIds: number[] | undefined;

           if(categoryIds){
            let categoryIdArray: string[];
            if (Array.isArray(categoryIds)) {
                 categoryIdArray = categoryIds;
            }else {
              categoryIdArray = categoryIds.split(',');
           }
            
            parsedCategoryIds = categoryIdArray
                .map((id: string) => parseInt(id.trim(), 10))
                .filter((id:number) => !isNaN(id));

            if (parsedCategoryIds.length === 0) {
            parsedCategoryIds = undefined;
            }
           }

            const parsedPage = page ? parseInt(page, 10):1;
            const parsedLimit = limit ? parseInt(limit, 10): 10;

            const finalPage = Math.max(1, parsedPage);
            const finalLimit = Math.max(1, parsedLimit);

            const events = await this.eventService.allEvent(
                    term,
                    parsedCategoryIds,
                    finalPage,
                    finalLimit
            );
            res.status(StatusCodes.OK).json(events)
        }catch(err){
            next(err)
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