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