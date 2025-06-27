import { DataSource, Repository } from "typeorm";

export class EventsService{
    private eventsRepository: Repository<Event>
    constructor(private dataSource: DataSource){
        this.eventsRepository = dataSource.getRepository(Event); 
    }

    async createEvent(id: number, createEventSchema: CreateEventSchema)


}