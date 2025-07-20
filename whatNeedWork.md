```typescript

// the below write code is one of the method to store and user and acccess it. I don't know yet how this work. But I have to soon look for it. How this thing works.

// base.entity.ts
import { 
  BaseEntity, 
  CreateDateColumn, 
  UpdateDateColumn, 
  Column, 
  BeforeInsert, 
  BeforeUpdate, 
  BeforeRemove 
} from 'typeorm';
import { getCurrentUser } from '../utils/context';

export abstract class BaseEntityWithTracking extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  created_by: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updated_by: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deleted_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @BeforeInsert()
  setCreatedBy() {
    const user = getCurrentUser();
    this.created_by = user?.id || user?.email || 'system';
  }

  @BeforeUpdate()
  setUpdatedBy() {
    const user = getCurrentUser();
    this.updated_by = user?.id || user?.email || 'system';
  }

  @BeforeRemove()
  setDeletedBy() {
    const user = getCurrentUser();
    this.deleted_by = user?.id || user?.email || 'system';
    this.deleted_at = new Date();
  }
}

// utils/context.ts
import { AsyncLocalStorage } from 'async_hooks';

interface UserContext {
  id?: string;
  email?: string;
  username?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<UserContext>();

export const setCurrentUser = (user: UserContext) => {
  return asyncLocalStorage.getStore();
};

export const getCurrentUser = (): UserContext | undefined => {
  return asyncLocalStorage.getStore();
};

export const runWithUser = <T>(user: UserContext, fn: () => T): T => {
  return asyncLocalStorage.run(user, fn);
};

// middleware/userContext.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { runWithUser } from '../utils/context';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username?: string;
  };
}

export const userContextMiddleware = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  const user = req.user; // Assuming you have auth middleware that sets req.user
  
  if (user) {
    runWithUser(user, () => {
      next();
    });
  } else {
    next();
  }
};

// Example entity extending base
// entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntityWithTracking } from './base.entity';

@Entity('users')
export class User extends BaseEntityWithTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;
}

import { EntityManager } from "typeorm";
import { SeederInterface } from "../seeder.interface";
import { Users } from "../../modules/users/models/Users.entity";
import { USER_ROLE } from "../../modules/users/enums/UserRole.enum";
import * as bcrypt from 'bcrypt';

export class adminSeeder implements SeederInterface {
    name = "adminSeeder"

    async run(dataSource: EntityManager){
        const userRepository = dataSource.getRepository(Users)
        const adminEmail = 'ashish@example.com'
        const defaultPassword = 'Test@1234'
        const existingAdmin = await userRepository.findOneBy({email: adminEmail})
        if(!existingAdmin){

            const salt =  await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(defaultPassword, salt)
            const adminUserDetails = userRepository.create({
                firstName: 'Ashish',
                lastName: 'Gupta',
                email: adminEmail,
                password: hashedPassword,
                role: USER_ROLE.ADMIN,
                created_at: new Date(),
            })
            await userRepository.save(adminUserDetails)
            console.log(`Admin user '${adminEmail}' has been seeded`)
        }else{
            console.log(`Admin user '${adminEmail}' already exists. Skipping seeding.`);
        }
            console.log('Admin seeded successfully')
    }
}





import { DataSource, Repository, Transaction } from "typeorm";
import { Ticket } from "./models/Ticket.entity";
import { CreateTicketInput } from "./validators/ticket.validators";
import { Users } from "../users/models/Users.entity";
import { Events } from "../events/entity/Events.entity";
import { BadRequestException, NotFoundException } from "../common/errors/http.exceptions";

export class TicketService {
    private ticketRepository: Repository<Ticket>;
    private userRepository: Repository<Users>;
    private eventRepository: Repository<Events>;
    constructor(private dataSource: DataSource){
        this.ticketRepository = dataSource.getRepository(Ticket),
        this.userRepository = dataSource.getRepository(Users),
        this.eventRepository = dataSource.getRepository(Events)
    }

    async createTicket(userId: number, createTicketInput: CreateTicketInput): Promise<Ticket[]>{
        return await this.dataSource.transaction(async transactionalEntityManager  => {
            const eventRepository = transactionalEntityManager.getRepository(Events);
            const ticketRepository = transactionalEntityManager.getRepository(Ticket);

            const event = await eventRepository.findOne({
                where: {id: createTicketInput.eventId}
            })

            if(!event){
                throw new NotFoundException(`Event with ID ${createTicketInput.eventId} not found.`)
            }

            if(event.isCancelled){
                throw new BadRequestException(`Cannot register for a cancleed event: ${event.title} -- ${event.id}`)
            }

            if(event.startDate > new Date()){

            }

            if(event.availableSeats < createTicketInput.numberOfTickets){
                  throw new BadRequestException(`Not enough seats available for ${event.title}. Only ${event.availableSeats} seats left.`);
            }

            const expectedPrice = event.ticketPrice * createTicketInput.numberOfTickets;

            if(createTicketInput.totalPrice !== expectedPrice){
                throw new BadRequestException(`Amount sent (${createTicketInput.totalPrice} does not match the total ticket price (${expectedPrice}) for ${createTicketInput.numberOfTickets} tickets)`)
            }

            const now = new Date();
            const registrationOpensAt = new Date(event.startDate.getTime() - 15* 60 * 60 * 1000);
            const registrationClosesAt = new Date(event.startDate.getTime() - 30 * 60 * 1000);


            if(now < registrationOpensAt){
                throw new BadRequestException(
                `Registration for ${event.title} has not opened yet. It opens on ${registrationOpensAt.toLocaleString()}.`
                )
            }
            if (now > registrationClosesAt) {
                throw new BadRequestException(
                    `Registration for ${event.title} has closed. It ended on ${registrationClosesAt.toLocaleString()}.`
  );
            
            })
        
    }
}