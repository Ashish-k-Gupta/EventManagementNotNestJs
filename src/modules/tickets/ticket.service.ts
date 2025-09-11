// import { DataSource, In, Repository } from "typeorm";
// import { Events } from "../events/entity/Events.entity";
// import { Ticket } from "./models/Ticket.entity";
// import { CreateTicketInput, UpdateTicketInput } from "./validators/ticket.validators";
// import { BadRequestException, NotFoundException } from "../common/errors/http.exceptions";
// import { Users } from "../users/models/Users.entity";
// import { EmailService } from "../../common/service/email.service";

// interface CancellationResult {
//   success: boolean;
//   cancelledTickets: number[];
//   failedTickets: { ticketId: number; reason: string }[];
// }
// export class TicketService{
//     private ticketRepo: Repository<Ticket>
//     private eventRepo: Repository<Events>
//     private userRepo: Repository<Users>
//     constructor(private dataSource: DataSource, private emailService: EmailService){
//          this.ticketRepo = dataSource.getRepository(Ticket)
//          this.eventRepo = dataSource.getRepository(Events)
//          this.userRepo = dataSource.getRepository(Users)
//     }

//     async findTickets(userId: number){
//         const [tickets, count] = await this.ticketRepo
//         .createQueryBuilder('ticket')
//         .leftJoinAndSelect('ticket.event', 'event')
//         .where('ticket.userId = :userId', {userId})
//         .select([
//             'ticket',
//             'event.id',
//             'event.title',
//             'event.description',
//             'event.startDate',
//             'event.endDate',
//             'event.ticketPrice'
//         ])
//         .getManyAndCount()
//         return [tickets, count];
//     }

//     async createTicket(userId: number, createTicketInput: CreateTicketInput): Promise<Ticket[]>{
//        return await this.dataSource.transaction(
//             async transactionEntityManger =>{
//                 const eventRepo = transactionEntityManger.getRepository(Events);
//                 const ticketRepo = transactionEntityManger.getRepository(Ticket);
//                 const userRepo = transactionEntityManger.getRepository(Users);

//                 const event = await eventRepo.findOne({where: {id: createTicketInput.eventId}, relations: ['user']})
//                 if(!event){
//                     throw new NotFoundException('Event not found')
//                 }
//                 if(event.isCancelled){
//                     throw new BadRequestException('This event has been cancelled');
//                 }


//                 const now = new Date();
//                 const registrationOpen = event.startDate.getTime() - 15 * 14 * 60 * 60 * 1000
//                 if(now.getTime() <  registrationOpen){
//                     throw new BadRequestException('Ticket sales have not opened yet for this event.');
//                 }


//                 const closeregistrations = event.endDate.getTime() - 60 * 60 * 1000;
//                 if(now.getTime() > closeregistrations){
//                      throw new BadRequestException('Ticket sales have closed for this event.');
//                 }

//                 if(event.availableSeats < createTicketInput.numberOfTickets){
//                     throw new BadRequestException(`Not enough tickets available. Only ${event.availableSeats} tickets remaining.`);
//                 }

//                 const expectedAmount = event.ticketPrice * createTicketInput.numberOfTickets;

//                 if(createTicketInput.totalPrice !== expectedAmount){
//                         throw new BadRequestException(`Provided total price does not match the calculated price. Payable amount is ${expectedAmount}`);
//                 }


//                 const tickets: Ticket[] = [];
//                 for(let i = 0; i < createTicketInput.numberOfTickets; i++){
//                     const ticket = new Ticket();
//                     ticket.userId = userId;
//                     ticket.eventId = createTicketInput.eventId;
//                     ticket.totalPrice = event.ticketPrice;
//                     tickets.push(ticket)
//                 }
//                 const savedTickets = await ticketRepo.save(tickets)
//                 event.availableSeats -= createTicketInput.numberOfTickets;
//                 await eventRepo.save(event)

//                 const user = await userRepo.findOne({where: {id: userId}})
//                 if(user && user.email){
//                   for (const ticket of savedTickets){
//                     await this.emailService.sendTicketConfirmationEmail(user.email, ticket, event), this.emailService.newRegistrationAlert(event.user.email, ticket, event, user);
//                   }
//                 }else{
//                     console.warn(`User with ID ${userId} not found or has no email. Skipping ticket confiramtion email`)
//                   }
//                 return savedTickets;
//         }
//     )}

//     async cancelTickets (userId: number, updateTicketInput: UpdateTicketInput): Promise<CancellationResult>{
      
//       if(!updateTicketInput.ticketId || updateTicketInput.ticketId.length === 0){
//         throw new BadRequestException('No ticket IDs provided for cancellation');
//       }

//       return this.dataSource.transaction(async transactionEntityManger =>{
//         const ticketRepo: Repository<Ticket> = transactionEntityManger.getRepository(Ticket);
//         const eventRepo: Repository<Events> = transactionEntityManger.getRepository(Events)

//         const ticketToProcess = await ticketRepo.find({
//           where: {
//             id: In(updateTicketInput.ticketId)
//           },
//           relations: ['event', 'user', 'event.user']
//         })
//         const failedCancellation : {ticketId: number, reason: string}[] = [];
//         const successfulCancellation: Ticket[] = [];

        
//         const foundTicketIds = new Set(ticketToProcess.map(t => t.id));
//         updateTicketInput.ticketId.forEach(inputId => {
//           if(!foundTicketIds.has(inputId)){
//             failedCancellation.push({ticketId: inputId, reason: 'Ticket not found'})
//           }
//         })
        
//         const now = new Date().getTime();

//         for(const ticket of ticketToProcess){
//           let reasonForFailure: string | null = null;

//             if(ticket.userId !== userId){
//               reasonForFailure = "You are not authorized to cancel this ticket."
//             }else if(ticket.isCancelled){
//                reasonForFailure ='Ticket is already cancelled.'
//             }else{
//               const eventStartDateTime = new Date(ticket.event.startDate).getTime()
//               const oneHourBeforeEvent = (eventStartDateTime - 60 * 60 * 1000)
              
//               if(now > oneHourBeforeEvent){
//                reasonForFailure = 'Event is about to start. Cannot cancel ticket now.';
//               }
//             }

//           if(reasonForFailure){
//             failedCancellation.push({ticketId: ticket.id, reason: reasonForFailure})
//           }else{
//             ticket.isCancelled = true;
//             successfulCancellation.push(ticket)
//             if(ticket.event){
//               ticket.event.availableSeats = (ticket.event.availableSeats || 0) + 1;
//             }
// {}          }
//         }

//         const eventToSave = new Map<number, Events>();
//         for(const ticket of successfulCancellation){
//           if(ticket.event){
//             eventToSave.set(ticket.event.id, ticket.event)
//           }
//         }

//         if(successfulCancellation.length > 0){
//           await ticketRepo.save(successfulCancellation)
//         }

//         if(eventToSave.size > 0){
//           await eventRepo.save(Array.from(eventToSave.values()));
//         }
//         const user = await this.userRepo.findOne({where: {id: userId}})
//         if(user && user.email){
//           for(const ticket of successfulCancellation){
//             await this.emailService.sendTicketCancelEmail(user.email, ticket, ticket.event), this.emailService.ticketCancellationAlert(ticket.event.user.email, ticket, ticket.event, ticket.user)

//           }
//         }

//         return{
//             success: failedCancellation.length === 0,
//             cancelledTickets: successfulCancellation.map(t => t.id),
//             failedTickets: failedCancellation
//         }
        
//       })
//     }

// }