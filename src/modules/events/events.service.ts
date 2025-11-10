import { DataSource, In, Repository } from "typeorm";
import { Events } from "./entity/Events.entity";
import { CreateEventInput, UpdateEventInput } from "./validators/event.validator";
import { CategoryService } from "../category/category.service";
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from "../common/errors/http.exceptions";
import { EventQueryParams } from "../../common/validation/eventQuerySchema";
import { EventDetailResponseDto, slotReponseDto } from "../../dto/eventDetailResponse.dto";
import { EventSlot } from "./entity/EventSlot.entity";

export class EventService {
    private eventRepository: Repository<Events>;
    private eventSlotRepository: Repository<EventSlot>;
    constructor(
        private dataSource: DataSource,
        private categorySerivce: CategoryService,
    ) {
        this.eventRepository = dataSource.getRepository(Events);
        this.eventSlotRepository = dataSource.getRepository(EventSlot);
    }

    async getEvent(params: EventQueryParams) {
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
            .leftJoin("event.slots", "slots")
            .addSelect([
                "slots.id",
                "slots.start_date",
                "slots.end_date",
                "slots.is_cancelled"
            ])
            .leftJoin("event.user", "user")
            .addSelect([
                "user.id",
                "user.firstName",
                "user.lastName",
            ])
            .leftJoin("event.categories", "category")
            .addSelect(["category.id", "category.name"])
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

        query.orderBy(`event.${sortBy}`, sortOrder);

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
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();


        try {
            const existingEvent = await queryRunner.manager.findOne(Events, { where: { title: createEventInput.title } });

            if (existingEvent) {
                throw new ConflictException(`An event named "${createEventInput.title}" already exists. Please choose a different title.`);
            }

            const categoriesDatabase = await this.categorySerivce.findCategoryListByIds(createEventInput.categoryIds);
            const uniqueReqCategoriesDatabase = new Set(categoriesDatabase.map(cat => cat.id));
            const uniqueReqCategories = new Set(createEventInput.categoryIds);
            const missingIds = [...uniqueReqCategories].filter(id => !uniqueReqCategoriesDatabase.has(id))
            if (missingIds.length > 0) {
                throw new NotFoundException(`Category with ID(s) ${missingIds.join(', ')} do not exist in the database`);
            }
            const newEvent = this.eventRepository.create({
                title: createEventInput.title,
                description: createEventInput.description,
                language: createEventInput.language,
                venue: createEventInput.venue,
                user: { id: userId },
                categories: categoriesDatabase,
                isCancelled: false,
                created_by: userId
            })

            const savedEvent = await queryRunner.manager.save(newEvent);

            const newEventSlot = createEventInput.slots.map(slotDto => {
                return this.eventSlotRepository.create({
                    start_date: slotDto.startDate,
                    end_date: slotDto.endDate,
                    total_seats: slotDto.totalSeats,
                    available_seats: slotDto.totalSeats,
                    ticket_price: slotDto.ticketPrice,
                    event: savedEvent

                })
            })
            await queryRunner.manager.save(newEventSlot);
            await queryRunner.commitTransaction();
            return savedEvent;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async findEventById(eventId: number): Promise<EventDetailResponseDto> {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['categories', 'slots', 'user'],

            select: {
                id: true,
                title: true,
                description: true,
                language: true,
                categories: { id: true, name: true },
                venue: true,
                isCancelled: true,
                created_by: true,
                user: {
                    firstName: true,
                    lastName: true,
                },
                slots: {
                    id: true,
                    start_date: true,
                    end_date: true,
                    is_cancelled: true,
                    total_seats: true,
                    available_seats: true,
                    ticket_price: true,
                    ticket: true,
                    is_sold_out: true,
                }
            }
        })

        if (!event) {
            throw new NotFoundException(`Event with ID "${eventId}" not found`)
        }


        const eventDto = new EventDetailResponseDto()
        eventDto.id = event.id;
        eventDto.title = event.title;
        eventDto.description = event.description;
        eventDto.language = event.language;
        eventDto.venue = event.venue;
        eventDto.isCancelled = event.isCancelled;
        eventDto.categories = event.categories.map((category) => category.name);
        eventDto.created_by = event.created_by;
        eventDto.users = {
            firstName: event.user.firstName,
            lastName: event.user.lastName
        };
        eventDto.slots = event.slots.map(slot => ({
            id: slot.id,
            start_date: slot.start_date,
            end_date: slot.end_date,
            total_seats: slot.total_seats,
            available_seats: slot.available_seats,
            ticket_price: slot.ticket_price,
            is_cancelled: slot.is_cancelled,
            is_sold_out: slot.is_sold_out,
        }))
        return eventDto;
    }

    async quickListEvent(): Promise<Events[]> {
        return this.eventRepository.find({
            relations: ['user'],
            select: {
                id: true,
                title: true,
                language: true,
                user: {
                    id: true,
                    firstName: true,
                },
                categories: { name: true },
                slots: { start_date: true, end_date: true, ticket_price: true }
            },
            order: { slots: { start_date: "ASC" } }
        });
    }

    async getEventSlots(eventId: number): Promise<slotReponseDto[]> {
        const event = await this.eventRepository.findOne({ where: { id: eventId } })
        if (!event) {
            throw new NotFoundException("Event not found!")
        }
        const slots = await this.eventSlotRepository.find({ where: { event: { id: eventId } } })
        return slots;
    }

    async getSlotById(slotId: number): Promise<slotReponseDto> {
        console.log("getSlotByid", slotId)
        const slot = await this.eventSlotRepository.findOne({ where: { id: slotId } })
        if (!slot) {
            throw new NotFoundException('Slot not found!')
        }
        console.log(slot);
        return slot;
    }

    async cancelEventSlot(slotId: number): Promise<void> {
        const updateResult = await this.eventSlotRepository.update({ id: slotId }, { is_cancelled: true })
        if (updateResult.affected === 0) {
            throw new NotFoundException("Event slot not found")
        }
    }

    async deleteSlot(slotId: number, userId: number): Promise<void> {
        const slotsToDelete = await this.eventSlotRepository.findOne
            ({
                where: { id: slotId },
                relations: ['event', 'event.user'],
            })
        if (!slotsToDelete) {
            throw new NotFoundException('Event slot not found.')
        }
        if (slotsToDelete.event.user.id !== userId) {
            throw new UnauthorizedException('You are not authorized to delete this event slot.');
        }
        const now = new Date();
        if (slotsToDelete.start_date < now) {
            throw new BadRequestException('Cannot delete an event slot that has already started.');
        }
        await this.eventSlotRepository.softRemove(slotsToDelete);
    }

    async cancelEvent(eventId: number): Promise<void> {
        await this.eventRepository.update(eventId, { isCancelled: true })
        await this.eventSlotRepository
            .createQueryBuilder()
            .update(EventSlot)
            .set({ is_cancelled: true })
            .where('event_id = :eventId', { eventId })
            .execute();
        return;
    }

    async cancelSlot(slotId: number) {
        const slot = await this.eventSlotRepository.update(slotId, { is_cancelled: true })
        return;
    }

    async updateEvent(userId: number, eventId: number, updateEventInput: UpdateEventInput) {

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const eventToUpdate = await this.eventRepository.findOne({
                where: { id: eventId },
                relations: ['slots']
            })

            console.log("Details", eventToUpdate)
            if (!eventToUpdate) {
                throw new NotFoundException("Event doesn't exists");
            }
            console.log(eventToUpdate.created_by, userId)
            if (eventToUpdate.created_by !== userId) {
                throw new UnauthorizedException("Not allowed to edit these")
            }

            const { slots, ...eventData } = updateEventInput;
            Object.assign(eventToUpdate, eventData);
            await queryRunner.manager.save(eventToUpdate);


            if (slots && slots.length > 0) {
                const slotIdsInRequest = slots.filter(s => s.id).map(s => s.id);
                const existingSlotIds = eventToUpdate.slots.map(s => s.id);

                const slotsToDelete = existingSlotIds.filter(id => !slotIdsInRequest.includes(id));
                if (slotsToDelete.length > 0) {
                    await queryRunner.manager.delete(EventSlot, { id: In(slotsToDelete) })
                }

                for (const slot of slots) {
                    if (slot.id) {
                        const slotToUpdate = eventToUpdate.slots.find(s => slot.id === s.id);
                        if (slotToUpdate) {
                            Object.assign(slotToUpdate, slot)
                            await queryRunner.manager.save(slotToUpdate);
                        } else {
                            throw new NotFoundException(`Event slot with ID ${slot.id} not found`)
                        }
                    } else {
                        const newSlot = this.eventSlotRepository.create({
                            ...slot,
                            event: eventToUpdate,
                        })
                        await queryRunner.manager.save(newSlot);
                    }
                }
            }

            await queryRunner.commitTransaction();
            return await this.eventRepository.findOne({
                where: { id: eventId },
                relations: ['slots']
            });

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release()


        }
    }

    async softRemoveAndCancelled(eventId: number): Promise<{ message: string }> {

        const eventToDelete = await this.eventRepository.findOne({ where: { id: eventId } });

        if (!eventToDelete) {
            throw new NotFoundException('Event not found')
        }
        eventToDelete.isCancelled = true;
        await this.eventRepository.softDelete(eventId);
        const res = `EVent ${eventToDelete.title} removed successfully`;
        return { message: res };
    }

}