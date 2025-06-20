import 'reflect-metadata';
import { createAndInitializeDataSource } from "./AppDataSource";
import { DataSource } from 'typeorm';
import { UserService } from './modules/users/services/user.service';

let userService: UserService;


async function  bootstrap() {
    try{
        const dataSource: DataSource = await createAndInitializeDataSource()
        userService = new UserService(dataSource);
        console.log('Application started successfully')
    }catch(error){
        console.error('Failed to bootstrap application:', error)
        process.exit(1);
    }
}
bootstrap();