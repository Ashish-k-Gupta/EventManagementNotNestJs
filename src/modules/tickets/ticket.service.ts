import { DataSource, In, Repository, Transaction } from "typeorm";
import { Events } from "../events/entity/Events.entity";
import { Ticket } from "./models/Ticket.entity";
import { CreateTicketInput, UpdateTicketInput } from "./validators/ticket.validators";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../common/errors/http.exceptions";

interface CancellationResult {
  success: boolean;
  cancelledTickets: number[];
  failedTickets: { ticketId: number; reason: string }[];
}
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

 async updateTicket(userId: number, updateTicketInput: UpdateTicketInput): Promise<CancellationResult> {

  if (!userId) {
    throw new UnauthorizedException('Not authorized to access this, or invalid token');
  }

  return this.dataSource.transaction(async transactionEntityManager => {
    const eventRepo = transactionEntityManager.getRepository(Events); 
    const ticketRepo = transactionEntityManager.getRepository(Ticket);

    const ticketsToProcess = await ticketRepo.find({
      where: { id: In(updateTicketInput.ticketId) },
      relations: ['event', 'user']
    });

    if (ticketsToProcess.length === 0) {
      throw new BadRequestException('No tickets found with the provided IDs.');
    }

    const failedCancellation: { ticketId: number; reason: string }[] = [];
    const successfulCancellation: Ticket[] = [];

    for (const ticket of ticketsToProcess) {
      let isTicketValidForCancellation = true; 

      if (ticket.userId !== userId) {
        failedCancellation.push({ ticketId: ticket.id, reason: 'You are not authorized to cancel this ticket.' });
        isTicketValidForCancellation = false;
      }

      if (ticket.isCancelled) {
        failedCancellation.push({ ticketId: ticket.id, reason: 'Ticket is already cancelled.' });
        isTicketValidForCancellation = false;
      }

      const eventStartTime = new Date(ticket.event.startDate);
      const oneHourBeforeEvent = new Date(eventStartTime.getTime() - 60 * 60 * 1000); 

      if (new Date() > oneHourBeforeEvent) { 
        failedCancellation.push({ ticketId: ticket.id, reason: 'Cancellation not available. Event is about to start (less than 1 hour away).' });
        isTicketValidForCancellation = false;
      }

      if (isTicketValidForCancellation) {
        ticket.isCancelled = true;
        successfulCancellation.push(ticket);
      }
    }

    if (successfulCancellation.length > 0) {
      await ticketRepo.save(successfulCancellation);
    }

    return {
      success: failedCancellation.length === 0,
      cancelledTickets: successfulCancellation.map(t => t.id),
      failedTickets: failedCancellation
    };
  });
}

}