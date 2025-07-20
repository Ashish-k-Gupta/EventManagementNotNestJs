import { DataSource, Repository } from "typeorm";
import { Events } from "./entity/Events.entity";
import { CreateEventInput, UpdateEventInput } from "./validators/event.validator";
import { CategoryService } from "../category/category.service";
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from "../common/errors/http.exceptions";
import { EventQueryParams } from "../../common/validation/eventQuerySchema";

export class EventService {
    private eventRepository: Repository<Events>;
    constructor(
        private dataSource: DataSource,
        private categorySerivce: CategoryService,
    ) {
        this.eventRepository = dataSource.getRepository(Events);
    }

    async getEvent(params: EventQueryParams) {
        console.log(params)
        const {
            page = 1,
            limit = 10,
            term,
            sortBy = 'created_at',
            sortOrder = 'DESC',
            startDate,
            endDate,
            priceMin,
            priceMax,
            categoryIds
        } = params;

        const query = this.eventRepository
            .createQueryBuilder("event")
            //  .select([
            // "event.id",
            // "event.title",
            // "event.description",
            // "event.language",
            // "event.ticketPrice",
            // "event.startDate",
            // "event.endDate",
            // "event.isCancelled",
            // "event.created_at", // You might want event's own created_at/updated_at
            // "event.updated_at"
            // ])
            .leftJoinAndSelect("event.user", "user")
            .addSelect([
            "user.id",
            "user.firstName",
            "user.lastName",
            "user.email"
            ])
            .leftJoinAndSelect("event.categories", "category")
            // .addSelect([
            // "category.id",
            // "category.name"
            // ])
            .where("event.isCancelled = false");

        if (term) {
            query.andWhere("event.title ILIKE :search", { search: `%${term}%` });
        }


        if (categoryIds) {
            let idsToFilter: number[] = [];
            if (Array.isArray(categoryIds)) {
                idsToFilter = categoryIds.map(id => parseInt(id)).filter(id => !isNaN(id)); // Parse and filter out invalid
            } else {
                const parsedId = parseInt(categoryIds);
                if (!isNaN(parsedId)) {
                    idsToFilter = [parsedId];
                }
            }

            if (idsToFilter.length > 0) {
                query.andWhere("category.id IN (:...categoryIds)", { categoryIds: idsToFilter });
            }
        }


        if (startDate) {
            query.andWhere("event.startDate >= :startDate", { startDate: new Date(startDate) });
        }
        if (endDate) {
            query.andWhere("event.endDate <= :endDate", { endDate: new Date(endDate) });
        }

        if (priceMin !== undefined) {
            query.andWhere("event.ticketPrice >= :priceMin", { priceMin });
        }
        if (priceMax !== undefined) {
            query.andWhere("event.ticketPrice <= :priceMax", { priceMax });
        }

        const total = await query.getCount();

        query.orderBy(`event.${sortBy}`, sortOrder); // Use backticks for column names if needed, or ensure 'sortBy' maps to a valid column

        query.skip((page - 1) * limit)
            .take(limit);

        const events = await query.getMany();

        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;

        return {
            data: events,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNext,
                hasPrevious
            }
        };
    }

    async createEvent(userId: number, createEventInput: CreateEventInput): Promise<Events> {
        const existingEvent = await this.eventRepository.findOne({ where: { title: createEventInput.title } })
        if (existingEvent) {
            throw new ConflictException(`An event named "${createEventInput.title}" already exists. Please choose a different title.`);
        }

        const categoriesDatabase = await this.categorySerivce.findCategoryListByIds(createEventInput.categoryIds)
        const uniqueCategoriesDatabase = new Set(categoriesDatabase.map(cat => cat.id))
        const uniqueReqCategories = new Set(createEventInput.categoryIds)

        const missingIds = [...uniqueReqCategories].filter(id => !uniqueCategoriesDatabase.has(id))
        if (missingIds.length > 0) {
            throw new NotFoundException(`Category with ID(s) ${missingIds.join(', ')} do not exist in the database`)
        }

        const newEvent = this.eventRepository.create({
            title: createEventInput.title,
            description: createEventInput.description,
            language: createEventInput.language,
            totalSeats: createEventInput.totalSeats,
            availableSeats: createEventInput.totalSeats,
            ticketPrice: createEventInput.ticketPrice,
            startDate: createEventInput.startDate,
            endDate: createEventInput.endDate,
            user: { id: userId },
            categories: categoriesDatabase,
            isCancelled: false,
            created_by: userId
        });
        return await this.eventRepository.save(newEvent);
    }

    async findEventById(eventId: number): Promise<Events> {
        const event = await this.eventRepository.findOne({
             where: { id: eventId },
             select: ['title', 'description', 'language', 'ticketPrice', 'startDate', 'endDate', 'categories']
            })

        if (!event) {
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

    async quickListEvent(): Promise<Events[]> {
        return this.eventRepository.find({
            relations: ['user'],
            select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true,
                language: true,
                ticketPrice: true,
                user: {
                    id: true,
                    firstName: true,
                },
                categories: false
            }
        });
    }


    async updateEvent(userId: number, eventId: number, updateEventInput: UpdateEventInput): Promise<Events> {
        const eventToUpdate = await this.eventRepository.findOne(
            {
                where: { id: eventId },
                relations: ['user', 'categories']
            })
        if (!eventToUpdate) {
            throw new NotFoundException(`Event with ID "${eventId} do not exist`)
        }

        if (eventToUpdate.user.id !== userId) {
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
        const res = await this.eventRepository.save(eventToUpdate);
        console.log("Response", res)
        return res;
    }

    async softRemoveAndCancelled(eventId: number): Promise<{ message: string }> {

        const eventToSoftDelete = await this.eventRepository.findOne({ where: { id: eventId } });

        if (!eventToSoftDelete) {
            throw new NotFoundException(`Event with ID "${eventId}" not found.`);
        }
        if (eventToSoftDelete.startDate && eventToSoftDelete.endDate < new Date()) {
            throw new BadRequestException('Cannot soft-delete an event that has already started')
        }

        eventToSoftDelete.isCancelled = true;
        eventToSoftDelete.deleted_at = new Date();

        const removedEvent = await this.eventRepository.save(eventToSoftDelete);
        const res = `Event ${removedEvent.title} removed successfully`;
        return { message: res }
    }

}