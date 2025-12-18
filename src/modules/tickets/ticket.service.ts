import { DataSource, EntityManager, In, Repository } from "typeorm";
import { Events } from "../events/entity/Events.entity";
import { Ticket } from "./models/Ticket.entity";
import { CreateTicketInput, UpdateTicketInput } from "./validators/ticket.validators";
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from "../common/errors/http.exceptions";
import { Users } from "../users/models/Users.entity";
import { EmailService } from "../../common/service/email.service";
import { EventSlot } from "../events/entity/EventSlot.entity";
import { error } from "console";
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
}