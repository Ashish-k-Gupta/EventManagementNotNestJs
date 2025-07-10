import { DataSource, Repository } from "typeorm";
import { Events } from "./entity/Events.entity";
import { CreateEventInput, UpdateEventInput } from "./validators/event.validator";
import { CategoryService } from "../category/category.service";
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from "../common/errors/http.exceptions";

export class EventService {
    private eventRepository: Repository<Events>;
    constructor(
        private dataSource: DataSource,
        private categorySerivce: CategoryService,
    ){
        this.eventRepository = dataSource.getRepository(Events);
    }

    async getEvent(term: string | undefined, categoryIds: number[] | undefined, page = 1, limit = 10){
        const query = this.eventRepository
        .createQueryBuilder("event")
        .leftJoinAndSelect("event.user", "user")
        .leftJoinAndSelect("event.categories", "category")
        .where("event.isCancelled = false");

        if(term){
        query.andWhere("event.name ILIKE :term", {term: `%${term}%`});
        }

        if(categoryIds &&  categoryIds.length > 0){
            query.andWhere("category.id IN (:...categoryIds)", {categoryIds});
        }

        const total = await query.getCount();

        const events = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
        return {total, events}
    }

    async createEvent(userId: number, createEventInput: CreateEventInput): Promise<Events>{
        const existingEvent = await this.eventRepository.findOne({where: {title: createEventInput.title}})
        if(existingEvent){
            throw new ConflictException(`An event named "${createEventInput.title}" already exists. Please choose a different name.`);
        }

        const categoriesDatabase = await this.categorySerivce.findCategoryListByIds(createEventInput.categoryIds)
        const uniqueCategoriesDatabase = new Set(categoriesDatabase.map(cat => cat.id))
        const uniqueReqCategories = new Set(createEventInput.categoryIds)

        const missingIds = [...uniqueReqCategories].filter(id => !uniqueCategoriesDatabase.has(id))
        if(missingIds.length > 0){
            throw new NotFoundException(`Category with ID(s) ${missingIds.join(', ')} do not exist in the database`)
        }

        const newEvent = this.eventRepository.create({
            title: createEventInput.title,
            description: createEventInput.description,
            language: createEventInput.language,
            ticketPrice: createEventInput.ticketPrice,
            startDate: createEventInput.startDate,
            endDate: createEventInput.endDate,
            user: {id: userId},
            categories: categoriesDatabase,
            isCancelled: false,
            created_by: userId
        });
        return await this.eventRepository.save(newEvent);
    }

    async findEventById(eventId: number): Promise<Events>{
        const event = await this.eventRepository.findOne({where: {id: eventId}})
        if(!event){
            throw new NotFoundException(`Event with ID "${eventId}" not found`)
        }
        return event;
    }

    // async findAllEvents(): Promise<Events[]>{
    //     return this.eventRepository.find({
    //         relations: ['user', 'categories'],
    //         select:{
    //             user:{
    //                 id: true,
    //                 firstName: true,
    //             },
    //             categories:{
    //                 id: true,
    //                 name: true
    //             }
    //         }
    //     });
    // }

    async quickListEvent(): Promise<Events[]>{
        return this.eventRepository.find({
            relations: ['user'],
            select:{
                id: true,
                title: true,
                startDate: true,
                endDate: true,
                language: true,
                ticketPrice: true,
                user:{
                    id: true,
                    firstName: true,
                },
                categories:false  
            }
        });
    }


    async updateEvent(userId: number, eventId: number, updateEventInput: UpdateEventInput): Promise<Events> {
     const eventToUpdate  =await this.eventRepository.findOne(
        {where: {id: eventId},
        relations: ['user', 'categories']
    })
     if(!eventToUpdate){
        throw new NotFoundException(`Event with ID "${eventId} do not exist`)
     }

     if(eventToUpdate.user.id !== userId){
        throw new UnauthorizedException(`You don't permission to access this event`)
     }

   if (updateEventInput.CategoryIds !== undefined) { 
            if (updateEventInput.CategoryIds.length === 0) {
                throw new BadRequestException('An event must have at least one category. You cannot remove all categories.');
            }

            const newCategories = await this.categorySerivce.findCategoryListByIds(updateEventInput.CategoryIds as number[]);
            const uniqueCategoriesDatabase = new Set(newCategories.map(cat => cat.id));
            const uniqueReqCategories = new Set(updateEventInput.CategoryIds as number[]);

            const missingIds = [...uniqueReqCategories].filter(id => !uniqueCategoriesDatabase.has(id));
            if (missingIds.length > 0) {
                throw new NotFoundException(`Category with ID(s) ${missingIds.join(', ')} do not exist in the database`);
            }
            eventToUpdate.categories = newCategories;
        }
        console.log("Eventtttttt Before", eventToUpdate)
        Object.assign(eventToUpdate, updateEventInput)
        console.log("Eventtttttt After", eventToUpdate)
        const res =await this.eventRepository.save(eventToUpdate); 
        console.log("Response", res)
        return res;
    }

    async softRemoveAndCancelled(eventId: number): Promise<{message: string}>{
        
        const eventToSoftDelete = await this.eventRepository.findOne({where: {id: eventId}});

        if (!eventToSoftDelete) {
            throw new NotFoundException(`Event with ID "${eventId}" not found.`);
        }
        if(eventToSoftDelete.startDate && eventToSoftDelete.endDate < new Date()){
            throw new BadRequestException('Cannot soft-delete an event that has already started')
        }

        eventToSoftDelete.isCancelled = true;
        eventToSoftDelete.deleted_at = new Date();

        const removedEvent =await this.eventRepository.save(eventToSoftDelete);
        const res = `Event ${removedEvent.title} removed successfully`;
        return{message: res}
    }

}