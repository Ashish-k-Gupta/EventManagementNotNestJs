import { DataSource, In, Repository, Transaction } from "typeorm";
import { Events } from "../events/entity/Events.entity";
import { Ticket } from "./models/Ticket.entity";
import { CreateTicketInput, UpdateTicketInput } from "./validators/ticket.validators";
import { BadRequestException, NotFoundException } from "../common/errors/http.exceptions";

export class TicketService{
    private eventRepo: Repository<Events>;
    private ticketRepo: Repository<Ticket>;

    constructor(private dataSource: DataSource){
        this.eventRepo = this.dataSource.getRepository(Events)
        this.ticketRepo = this.dataSource.getRepository(Ticket)
    }

    async findTickets(userId: number){
        const [tickets, count] = await this.ticketRepo
        .createQueryBuilder('ticket')
        .leftJoinAndSelect('ticket.event', 'event')
        .where('ticket.userId = :userId', {userId})
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

    async createTicket(userId: number, createTicketInput: CreateTicketInput): Promise<Ticket[]>{
       return await this.dataSource.transaction(
            async transactionEntityManger =>{
                const eventRepo = transactionEntityManger.getRepository(Events);
                const ticketRepo = transactionEntityManger.getRepository(Ticket);

                const event = await eventRepo.findOne({where: {id: createTicketInput.eventId}})
                if(!event){
                    throw new NotFoundException('Event not found')
                }
                if(event.isCancelled){
                    throw new BadRequestException('This event has been cancelled');
                }


                const now = new Date();
                const registrationOpen = event.startDate.getTime() - 15 * 14 * 60 * 60 * 1000
                if(now.getTime() <  registrationOpen){
                    throw new BadRequestException('Ticket sales have not opened yet for this event.');
                }


                const closeregistrations = event.endDate.getTime() - 60 * 60 * 1000;
                if(now.getTime() > closeregistrations){
                     throw new BadRequestException('Ticket sales have closed for this event.');
                }

                if(event.availableSeats < createTicketInput.numberOfTickets){
                    throw new BadRequestException(`Not enough tickets available. Only ${event.availableSeats} tickets remaining.`);
                }

                const expectedAmount = event.ticketPrice * createTicketInput.numberOfTickets;

                if(createTicketInput.totalPrice !== expectedAmount){
                        throw new BadRequestException(`Provided total price does not match the calculated price. Payable amount is ${expectedAmount}`);
                }


                const tickets: Ticket[] = [];
                for(let i = 0; i < createTicketInput.numberOfTickets; i++){
                    const ticket = new Ticket();
                    ticket.userId = userId;
                    ticket.eventId = createTicketInput.eventId;
                    ticket.totalPrice = event.ticketPrice;
                    tickets.push(ticket)
                }
                const savedTickets = await ticketRepo.save(tickets)
                event.availableSeats -= createTicketInput.numberOfTickets;
                await eventRepo.save(event)
                return savedTickets;


        }
    )}

   async updateTicket(userId: number, updateTicketInput: UpdateTicketInput):Promise<void>{
      await this.dataSource.transaction(
        async transactionEntityManger =>{
            const ticketRepo = transactionEntityManger.getRepository(Ticket);
            const eventRepo = transactionEntityManger.getRepository(Events);

            const ticketToCancel = await this.ticketRepo.find({
                where: {
                    id: In(updateTicketInput.ticketId),
                    isCancelled: false,
                },
                relations: ['event', 'user'],
            })

        const failedCancellations: {ticketId: number; reason: string}[] = [];
        const successfulCancellations: Ticket[] = [];

            if(!ticketToCancel){
                throw new BadRequestException(`Either the ticket is doesn't exist or already marked as cancelled`)
            }

            for(const ticket of ticketToCancel){
                if(ticket.userId !== userId){
                    failedCancellations.push({ticketId: ticket.id, reason:'Not authorized to cancel this ticket.'})
                    continue;
                }

            const eventStartTime = new Date(ticket.event.startDate);
            const oneHourBeforeEvent = new Date(eventStartTime.getTime() - 60*60*1000)
            if(new Date() < oneHourBeforeEvent){
                failedCancellations.push({ticketId: ticket.id, reason: 'Event too close to start time for cancellation.'})
                continue;
            }

                if(ticket.isCancelled){
                    failedCancellations.push({ticketId: ticket.id, reason: 'Ticket is already marked as cancelled'})
                    continue;
                }

                ticket.isCancelled = true;
                successfulCancellations.push(ticket)
            }

            if(successfulCancellations.length > 0){
                await this.ticketRepo.save(successfulCancellations);
            }

            return{
                success: failedCancellations.length === 0,
                cancelledTickets: successfulCancellations.map(t => t.id),
                failedTickets: failedCancellations
            }

        }
      )
   }


}