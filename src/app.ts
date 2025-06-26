import 'reflect-metadata';
import { createAndInitializeDataSource } from "./AppDataSource";
import { DataSource } from 'typeorm';
import { UserService } from './modules/users/services/user.service';
import express, { NextFunction, Request, Response } from 'express';
import { userRouter } from './modules/users/routes/user.routes';
import { InvalidCredentialsException, NotFoundException } from './modules/common/errors/http.exceptions';
import { StatusCodes } from 'http-status-codes';


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

            if(err instanceof NotFoundException){
                res.status(StatusCodes.NOT_FOUND).json({message: err.message})
                return; 
            }
            if(err instanceof InvalidCredentialsException){
                res.status(StatusCodes.UNAUTHORIZED).json({message: err.message})
                return;
            }
            
            let message = 'An unexpected error occurred.';

            // For production, avoid sending sensitive error details.
            if (process.env.NODE_ENV === 'production') {
                 message = 'An internal server error occurred.';
            }else{

            }

           res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: message });
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