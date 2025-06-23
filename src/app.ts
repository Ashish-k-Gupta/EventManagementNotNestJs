import 'reflect-metadata';
import { createAndInitializeDataSource } from "./AppDataSource";
import { DataSource } from 'typeorm';
import { UserService } from './modules/users/services/user.service';
import express from 'express';


const app = express();
const port = process.env.PORT || 3001;
let userService: UserService;


async function  bootstrap() {
    try{
        const dataSource: DataSource = await createAndInitializeDataSource()
        userService = new UserService(dataSource);
        
        app.get('/', (req, res) => {
            res.send('Hello World!');
        });
         app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    }catch(error){
        console.error('Failed to bootstrap application:', error)
        process.exit(1);
    }
}
bootstrap();