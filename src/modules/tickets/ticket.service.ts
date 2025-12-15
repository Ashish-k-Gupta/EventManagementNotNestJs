import { DataSource, In, Repository } from "typeorm";
import { Events } from "../events/entity/Events.entity";
import { Ticket } from "./models/Ticket.entity";
import { CreateTicketInput, UpdateTicketInput } from "./validators/ticket.validators";
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from "../common/errors/http.exceptions";
import { Users } from "../users/models/Users.entity";
import { EmailService } from "../../common/service/email.service";
import { EventSlot } from "../events/entity/EventSlot.entity";
import { error } from "console";


export class TicketService {
    private ticketRepo: Repository<Ticket>
    private eventRepo: Repository<Events>
    private userRepo: Repository<Users>
    private slotRepo: Repository<EventSlot>

    constructor(private dataSource: DataSource, private emailService: EmailService) {
        this.ticketRepo = dataSource.getRepository(Ticket);
        this.eventRepo = dataSource.getRepository(Events);
        this.userRepo = dataSource.getRepository(Users);
        this.slotRepo = dataSource.getRepository(EventSlot);
    }

    async findTickets(userId: string) {
        const [tickets, count] = await this.ticketRepo
            .createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.event', 'event', 'slots')
            .where('ticket.userId = :userId', { userId })
            .select([
                'ticket',
                'event.id',
                'event.title',
                'event.description',
                'event.startDate',
                'event.endDate',
                'event.ticketPrice'
            ])
            .getManyAndCount()
        return [tickets, count];
    }

    async issueTicketFromCart(userId: string) {
        return this.dataSource.transaction(async (manager) => {
            const 
        })
    }

    // async createTicket(userId: string, createTicketInput: CreateTicketInput): Promise<Ticket[]> {
    //     console.log(createTicketInput);
    //     return await this.dataSource.transaction(
    //         async transactionEntityManger => {
    //             const eventRepo = transactionEntityManger.getRepository(Events);
    //             const ticketRepo = transactionEntityManger.getRepository(Ticket);
    //             const userRepo = transactionEntityManger.getRepository(Users);
    //             const slotsRepo = transactionEntityManger.getRepository(EventSlot);

    //             const slot = await slotsRepo.findOne({ where: { id: createTicketInput.slotId }, relations: ['event', 'event.user'] })
    //             if (!slot) {
    //                 throw new NotFoundException('Slot not found')
    //             }

    //             if (slot.is_cancelled) {
    //                 throw new BadRequestException('This slot has been cancelled');
    //             }

    //             if (slot.event.isCancelled) {
    //                 throw new NotFoundException('This even has been cancelled')
    //             }

    //             const event = slot.event;

    //             const now = new Date();
    //             const registrationOpen = slot.start_date.getTime() - 15 * 14 * 60 * 60 * 1000
    //             if (now.getTime() < registrationOpen) {
    //                 throw new BadRequestException('Ticket sales have not opened yet for this event.');
    //             }


    //             const closeregistrations = slot.end_date.getTime() - 60 * 60 * 1000;
    //             if (now.getTime() > closeregistrations) {
    //                 throw new BadRequestException('Ticket sales have closed for this event.');
    //             }

    //             if (slot.available_seats < createTicketInput.numberOfTickets) {
    //                 throw new BadRequestException(`Not enough tickets available. Only ${slot.available_seats} tickets remaining.`);
    //             }

    //             const expectedAmount = slot.ticket_price * createTicketInput.numberOfTickets;

    //             if (createTicketInput.totalPrice !== expectedAmount) {
    //                 throw new BadRequestException(`Provided total price does not match the calculated price. Payable amount is ${expectedAmount}`);
    //             }


    //             const tickets: Ticket[] = [];
    //             for (let i = 0; i < createTicketInput.numberOfTickets; i++) {
    //                 const ticket = new Ticket();
    //                 ticket.userId = userId;
    //                 ticket.eventSlotid = createTicketInput.slotId;
    //                 ticket.totalPrice = slot.ticket_price;
    //                 tickets.push(ticket)
    //             }
    //             const savedTickets = await ticketRepo.save(tickets)
    //             slot.available_seats -= createTicketInput.numberOfTickets;
    //             await this.slotRepo.save(slot);

    //             const user = await userRepo.findOne({ where: { id: userId } });
    //             if (user && user.email) {
    //                 for (const ticket of savedTickets) {
    //                     await this.emailService.sendTicketConfirmationEmail(user.email, ticket, event),
    //                         this.emailService.newRegistrationAlert(event.user.email, ticket, event, user);
    //                 }
    //             } else {
    //                 console.warn(`User with ID ${userId} not found or has no email. Skipping ticket confiramtion email`)
    //             }
    //             return savedTickets;
    //         }
    //     )
    // }

    // async cancelTickets(userId: number, updateTicketInput: UpdateTicketInput): Promise<CancellationResult> {

    //     if (!updateTicketInput.ticketId || updateTicketInput.ticketId.length === 0) {
    //         throw new BadRequestException('No ticket IDs provided for cancellation');
    //     }

    //     return this.dataSource.transaction(async transactionEntityManger => {
    //         const ticketRepo: Repository<Ticket> = transactionEntityManger.getRepository(Ticket);
    //         const eventRepo: Repository<Events> = transactionEntityManger.getRepository(Events);
    //         const slotRepo: Repository<EventSlot> = transactionEntityManger.getRepository(EventSlot);

    //         const ticketToProcess = await ticketRepo.find({
    //             where: {
    //                 id: In(updateTicketInput.ticketId)
    //             },
    //             select: {

    //             },
    //             relations: ['user', 'event']
    //         })

    //         console.log("TICKET", ticketToProcess)
    //         const failedCancellation: { ticketId: number, reason: string }[] = [];
    //         const successfulCancellation: Ticket[] = [];


    //         const foundTicketIds = new Set(ticketToProcess.map(t => t.id));
    //         updateTicketInput.ticketId.forEach(inputId => {
    //             if (!foundTicketIds.has(inputId)) {
    //                 failedCancellation.push({ ticketId: inputId, reason: 'Ticket not found' })
    //             }
    //         })

    //         const now = new Date().getTime();

    //         for (const ticket of ticketToProcess) {
    //             let reasonForFailure: string | null = null;

    //             if (ticket.userId !== userId) {
    //                 reasonForFailure = "You are not authorized to cancel this ticket."
    //             } else if (ticket.isCancelled) {
    //                 reasonForFailure = 'Ticket is already cancelled.'
    //             } else {
    //                 const eventStartDateTime = new Date(ticket.event.start_date).getTime()
    //                 const oneHourBeforeEvent = (eventStartDateTime - 60 * 60 * 1000)

    //                 if (now > oneHourBeforeEvent) {
    //                     reasonForFailure = 'Event is about to start. Cannot cancel ticket now.';
    //                 }
    //             }

    //             if (reasonForFailure) {
    //                 failedCancellation.push({ ticketId: ticket.id, reason: reasonForFailure })
    //             } else {
    //                 ticket.isCancelled = true;
    //                 successfulCancellation.push(ticket)
    //                 if (ticket.event) {
    //                     ticket.event.available_seats = (ticket.event.available_seats || 0) + 1;
    //                 }
    //                 { }
    //             }
    //         }

    //         const eventToSave = new Map<number, Events>();
    //         for (const ticket of successfulCancellation) {
    //             if (ticket.event) {
    //                 eventToSave.set(ticket.eventSlotId, ticket.event)
    //             }
    //         }

    //         if (successfulCancellation.length > 0) {
    //             await ticketRepo.save(successfulCancellation)
    //         }

    //         if (eventToSave.size > 0) {
    //             await eventRepo.save(Array.from(eventToSave.values()));
    //         }
    //         const user = await this.userRepo.findOne({ where: { id: userId } })
    //         if (user && user.email) {
    //             for (const ticket of successfulCancellation) {
    //                 await this.emailService.sendTicketCancelEmail(user.email, ticket, ticket.eventSlotId), this.emailService.ticketCancellationAlert(ticket.event.user.email, ticket, ticket.event, ticket.user)

    //             }
    //         }

    //         return {
    //             success: failedCancellation.length === 0,
    //             cancelledTickets: successfulCancellation.map(t => t.id),
    //             failedTickets: failedCancellation
    //         }

    //     })
    // }

    async cancelTicket(userId: string, ticketId: string): Promise<Ticket> {
        if (!userId || !ticketId) {
            throw new BadRequestException('Ticket ID and User ID are required')
        }

        const ticket = await this.ticketRepo.findOne({
            where: {
                userId: userId,
                id: ticketId
            },
            relations: ['eventSlot', 'eventSlot.event', 'user', 'eventSlot.event.user']
        })
        if (!ticket) {
            throw new ForbiddenException('Resource Access Denied or Not Found')
        }

        if (ticket.isCancelled) {
            throw new BadRequestException('Ticket already cancelled')
        }

        const currentTime = new Date();

        if (ticket.eventSlot.start_date < currentTime) {
            throw new BadRequestException("Can't Cancel ticket, Event has begun")
        }

        const ticketToCancel = await this.dataSource.transaction(async (transactionManager) => {
            ticket.isCancelled = true;
            ticket.eventSlot.available_seats += ticket.numberOfTickets;

            await transactionManager.save(ticket);
            await transactionManager.save(ticket.eventSlot);
            return ticket;
        })

        console.log(ticketToCancel);

        try {
            const userEmail = ticket.user.email;
            const organizerEmail = ticket.eventSlot.event.user.email;

            await Promise.all([
                this.emailService.sendTicketCancelEmail(userEmail, ticket, ticket.eventSlot.event),
                this.emailService.ticketCancellationAlert(ticket.eventSlot.event.user.email, ticket, ticket.eventSlot.event, ticket.user)
            ])

        } catch {
            console.error("Failed to send cancellation emails", error)
        }
        return ticketToCancel;
    }

    async getTicketDetail(userId: string, ticketId: string) {
        ``
        if (!userId || !ticketId) {
            throw new BadRequestException('Ticket ID and User ID are required.');
        }
        const ticket = await this.ticketRepo.findOne({
            where: { id: ticketId, userId: userId },
            relations: ['eventSlot', 'eventSlot.event'],
            select: {
                eventSlot: {
                    id: true,
                    created_by: true,
                    start_date: true,
                    end_date: true,
                    ticket_price: true,
                    is_cancelled: true,
                    event: {
                        id: true,
                        title: true,
                        description: true,
                        language: true,
                        venue: true,
                        isCancelled: true
                    }
                },

            }
        })

        if (!ticket) {
            throw new ForbiddenException('Resource access denied or not found.');
        }

        console.log(ticket);
        return ticket;
    }

}