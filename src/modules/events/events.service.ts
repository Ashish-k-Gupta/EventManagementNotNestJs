import { DataSource, Repository } from "typeorm";
import { Events } from "./entity/Events.entity";
import { CreateEventInput, UpdateEventInput } from "./validators/event.validator";
import { CategoryService } from "../category/category.service";
import { NotFoundException, UnauthorizedException } from "../common/errors/http.exceptions";

export class EventService {
    private eventRepository: Repository<Events>;
    constructor(
        private dataSource : DataSource,
        private categorySerivce: CategoryService,
    ){
        this.eventRepository = this.dataSource.getRepository(Events);
    }

    async createEvent(userId: number, createEventInput: CreateEventInput): Promise<Events>{

        const categoriesDatabase =await this.categorySerivce.findCategoryListByIds(createEventInput.categoryIds)
        const uniqueCategoriesDatabase = new Set(categoriesDatabase.map(cat => cat.id))
        const uniqueReqCategories = new Set(createEventInput.categoryIds)

        const missingIds = [...uniqueReqCategories].filter(id => !uniqueCategoriesDatabase)
        if(missingIds.length > 0){
            throw new NotFoundException(`Category with ID(s) ${missingIds.join(', ')} do not exist in the database`)
        }

        const newEvent = this.eventRepository.create({
            name: createEventInput.name,
            description: createEventInput.description,
            language: createEventInput.language,
            ticketPrice: createEventInput.ticketPrice,
            fromDate: createEventInput.fromDate,
            tillDate: createEventInput.tillDate,
            user: {id: userId},
            categories: categoriesDatabase,
            isCancelled: false,
        })
        return await this.eventRepository.save(newEvent);
    }

    async findEventById(eventId: number): Promise<Events>{
        const event = await this.eventRepository.findOne({where: {id: eventId}})
        if(!event){
            throw new NotFoundException(`Event with ID "${eventId}" not found`)
        }
        return event;
    }

    async findAllEvents(): Promise<Events[]>{
        return this.eventRepository.find();
    }


    async updateEvent(userId: number, eventId: number, updateEventInput: UpdateEventInput): Promise<Events>{
        const event = await this.eventRepository.findOne({
            where: {id: eventId},
            relations: ['user', 'categories'],
        });
        
        if (!event) {
        throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }
        if(event.user.id !== userId){
            throw new UnauthorizedException("You are not authorized to update this event")
        }
        
    }
}