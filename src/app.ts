import 'reflect-metadata';
import { createAndInitializeDataSource } from "./AppDataSource";
import { DataSource } from 'typeorm';
import express, { NextFunction, Request, Response } from 'express';
import { userRouter } from './modules/users/routes/user.routes';
import { AppError, InvalidCredentialsException, NotFoundException } from './modules/common/errors/http.exceptions';
import { StatusCodes } from 'http-status-codes';
import { authRouter } from './modules/auth/routes/auth.routes';
import { authenticateJWT } from './modules/common/middlewares/auth.middleware';
import { eventRouter } from './modules/events/routes/event.routes';
import { catergoryRouter } from './modules/category/routes/catergory.routes';
import { UserController } from './modules/users/User.controller';
import { UserService } from './modules/users/user.service';
import { CategoryService } from './modules/category/category.service';
import { CatergoryController } from './modules/category/category.controller';
import { EventController } from './modules/events/events.controller';
import { EventService } from './modules/events/events.service';
import { ticketRouter } from './modules/tickets/routes/ticket.routes';
import { TicketService } from './modules/tickets/ticket.service';
import { TicketController } from './modules/tickets/ticket.controller';


const app = express();
const port = process.env.SERVER_PORT || 3001;


async function  bootstrap() {
    try{
        const dataSource: DataSource = await createAndInitializeDataSource()
        const userService = new UserService(dataSource);
        const userController = new UserController(userService);

        const categorySerivce = new CategoryService(dataSource);
        const catergoryController = new CatergoryController(categorySerivce);

        const eventService = new EventService( dataSource, categorySerivce);
        const eventController = new EventController(eventService);

        const ticketService = new TicketService(dataSource)
        const ticketController = new TicketController(ticketService)

        console.log('Database initialized successfully')

        app.use(express.json())
        app.use(express.urlencoded({extended: true}));
        
        app.get('/', (req, res) => {
            res.send('Hello World!');
        });
        app.use('/auth', authRouter(dataSource));

        app.use(authenticateJWT);
        app.use('/users', userRouter(userController));
        app.use('/category', catergoryRouter(catergoryController));
        app.use('/events', eventRouter(eventController));
        app.use('/tickets', ticketRouter(ticketController));


        app.use((err: Error, req: Request, res: Response, next: NextFunction) =>{
            console.error('Caught by global error handler', err);

            if(err instanceof AppError){
                res.status(err.statusCode).json({
                    message: err.message,
                    statusCode: err.statusCode,
                    isOperational: err.isOperational,
                    name: err.name,
                })
            }else{
                let message = "An unexpected server error occured.";
                if(process.env.NODE_ENV !== 'production'){
                    message: `Internal Server Error: ${err.message}`;
                }
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message})
            }
        })

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
        
        }catch(error){
        console.error('Failed to bootstrap application:', error)
        process.exit(1);
    }
}
bootstrap();