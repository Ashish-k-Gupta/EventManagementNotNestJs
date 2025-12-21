import { DataSource, EntityManager, In, Repository } from "typeorm";
import { Events } from "../events/entity/Events.entity";
import { Ticket } from "./models/Ticket.entity";
import { BadRequestException, ForbiddenException, UnauthorizedException } from "../common/errors/http.exceptions";
import { Users } from "../users/models/Users.entity";
import { EmailService } from "../../common/service/email.service";
import { EventSlot } from "../events/entity/EventSlot.entity";
import { CartItem } from "../cart/entity/CartItem.entity";


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
        const allTickets = await this.dataSource.getRepository(Ticket).find({
            where:
                { userId: userId }
        })

        if (!allTickets) {
            return { status: "Success", message: "No Tickets Are Available" }
        }
        return {
            message: "Success",

            list: allTickets
        };
    }

    async issueTicketFromCart(userId: string, manager: EntityManager, cartItem: CartItem[]) {
        const ticketRepo = manager.getRepository(Ticket);
        const ticketsToSave: Ticket[] = [];
        const user = await this.userRepo.findOne({ where: { id: userId } })
        const userEmail = user?.email;


        const transactionId = crypto.randomUUID();

        for (const item of cartItem) {
            for (let i = 0; i < item.quantity; i++) {
                const newTicket = ticketRepo.create({
                    userId: userId,
                    eventSlotid: item.eventSlot.id,
                    price: item.price_snapshot,
                    transactionId: transactionId
                })
                ticketsToSave.push(newTicket)
            }
        }
        return await ticketRepo.save(ticketsToSave);
    }


    async sendConfirmationEmails(tickets: Ticket[]) {
        try {
            for (const ticket of tickets) {
                await this.emailService.sendTicketConfirmationEmail(
                    ticket.user.email,
                    ticket,
                    ticket.eventSlot.event
                );
            }
        } catch (error) {
            console.error("Post-checkout email failed:", error);
        }
    }



    async getTicketDetail(userId: string, ticketId: string) {
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

        return ticket;
    }


    cancelTicket(userId: string, ticketId: string) {
        console.log("hello, world")
        return this.dataSource.transaction(async (manager: EntityManager) => {
            const ticketRepo = manager.getRepository(Ticket);
            const eventSlotRepo = manager.getRepository(EventSlot);

            const ticket = await ticketRepo.findOne({
                where: {
                    userId: userId,
                    id: ticketId
                },
                relations: ['eventSlot', 'eventSlot.event'],
                select: {
                    id: true,
                    userId: true,
                    price: true,
                    isCancelled: true,
                    registeredAt: true,
                    eventSlot: {
                        id: true,
                        created_at: true,
                        start_date: true,
                        end_date: true,
                        total_seats: true,
                        available_seats: true,
                        is_sold_out: true,
                        is_cancelled: true,
                        event: {
                            id: true,
                            title: true,
                            description: true,
                            language: true,
                            venue: true,
                            isCancelled: true
                        }
                    }
                }
            })

            if (!ticket) {
                throw new UnauthorizedException('Invalid Input')
            }


            const now = new Date().getTime();
            const startDate = new Date(ticket.eventSlot.start_date).getTime();
            const endDate = new Date(ticket.eventSlot.end_date).getTime();

            if (ticket.eventSlot.event.isCancelled || ticket.eventSlot.is_cancelled) {
                throw new BadRequestException('This event has already been cancelled.');
            }

            if (endDate < now) {
                throw new BadRequestException('Cannot cancel a ticket for a past event.');
            }

            const bufferInMs = 15 * 60 * 1000;
            if (now > (startDate - bufferInMs)) {
                const message = now > startDate
                    ? 'Cannot cancel a ticket once the show has started.'
                    : 'Tickets cannot be cancelled within 15 minutes of the start time.';
                throw new BadRequestException(message);
            }

            ticket.eventSlot.available_seats += 1;
            ticket.isCancelled = true;
            eventSlotRepo.save(ticket.eventSlot);
            ticketRepo.save(ticket);
            return ticket;
        })
    }
}