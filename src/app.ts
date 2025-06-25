import 'reflect-metadata';
import { createAndInitializeDataSource } from "./AppDataSource";
import { DataSource } from 'typeorm';
import { UserService } from './modules/users/services/user.service';
import express, { NextFunction, Request, Response } from 'express';
import { userRouter } from './modules/users/routes/user.routes';


const app = express();
const port = process.env.PORT || 3001;
// let userService: UserService;


async function  bootstrap() {
    try{
        const dataSource: DataSource = await createAndInitializeDataSource()
        console.log('Database initialized successfully')

        app.use(express.json())
        app.use(express.urlencoded({extended: true}));
        
        app.get('/', (req, res) => {
            res.send('Hello World!');
        });
        app.use('/users', userRouter(dataSource));

       app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.error('Global error handler caught:', err); 
            let statusCode = 500;
            let message = 'An unexpected error occurred.';

            // For production, avoid sending sensitive error details.
            if (process.env.NODE_ENV === 'production' && statusCode === 500) {
                 message = 'An internal server error occurred.';
            }

            res.status(statusCode).json({ message });
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