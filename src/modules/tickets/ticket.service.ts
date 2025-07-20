import { DataSource, Repository } from "typeorm";
import { Events } from "../events/entity/Events.entity";
import { Ticket } from "./models/Ticket.entity";
import { CreateTicketInput } from "./validators/ticket.validators";
import { BadRequestException, NotFoundException } from "../common/errors/http.exceptions";

export class TicketService{
    private eventRepo: Repository<Events>;
    private ticketRepo: Repository<Ticket>;

    constructor(private dataSource: DataSource){
        this.eventRepo = this.dataSource.getRepository(Events)
        this.ticketRepo = this.dataSource.getRepository(Ticket)
    }

    async findTickets(userId: number){
        const allTickets = await this.ticketRepo.find({where: {userId}})
        return allTickets;
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
                    throw new BadRequestException('')
                }

                const now = new Date();
                const registrationOpen = event.startDate.getTime() - 15 * 14 * 60 * 60 * 1000
                if(now.getTime() >  registrationOpen){
                    
                }

                const closeregistrations = event.endDate.getTime() - 60 * 60 * 1000;

                if(now.getTime() < closeregistrations){

                }

                if(event.availableSeats < createTicketInput.numberOfTickets){

                }

                const expectedAmount = event.ticketPrice * createTicketInput.numberOfTickets;

                if(createTicketInput.totalPrice !== expectedAmount){

                }


                const tickets: Ticket[] = [];
                for(let i = 0; i <= createTicketInput.numberOfTickets; i++){
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
}