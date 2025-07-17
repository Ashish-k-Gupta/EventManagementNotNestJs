import { EntityManager } from "typeorm";
import { SeederInterface } from "../seeder.interface";
import * as bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Users } from "../../modules/users/models/Users.entity";
import { USER_ROLE } from "../../modules/users/enums/UserRole.enum";
dotenv.config();

export class adminSeeder implements SeederInterface{

    name = 'adminSeeder';
    async run(dataSource: EntityManager): Promise<void>{

        const userRepo = dataSource.getRepository(Users) 
        const adminEmail = 'ashish@example.com';
          const rawAdminPassword = process.env.ADMIN_PASSWORD;

        if (!rawAdminPassword) {
            console.error(
                '❌ Error: ADMIN_PASSWORD environment variable is not set. Cannot seed admin user.',
        );
        return
        }

        const existingAdmin = await userRepo.findOneBy({email: adminEmail})
          if (existingAdmin) {
           console.log(`ℹ️ Admin user with email ${adminEmail} already exists. Skipping creation.`);
             return; 
          }

          let hashPassword: string;
            try{
                const saltRound = 10;
                const salt = await bcrypt.genSalt(saltRound)
                hashPassword = await bcrypt.hash(rawAdminPassword, salt);
                console.log('✅ Admin password successfully hashed');
            }catch(error){
                console.error('❌ Error hashing admin password:', error)
                throw new Error('Failed to hash admin password during seeding')
            }

            try{
                const adminUser = userRepo.create({
                    firstName: 'Ashish',
                    lastName: 'Gupta',
                    email: adminEmail,
                    password: hashPassword,
                    role: USER_ROLE.ADMIN,
                    created_at: new Date(),
                    updated_at: new Date()
                })

                await userRepo.save(adminUser);
                console.log(`✨ Admin user with email "${adminEmail}" successfully created.`);
            }catch(error){
                console.error(`❌ Error creating or saving admin user with email ${adminEmail}:`, error);
                throw new Error('Failed to save admin user during seeding.');
            }
    }
}