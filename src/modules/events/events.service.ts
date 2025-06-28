import { DataSource, Repository } from "typeorm";
import { CreateEventInput } from "./validators/event.validator";
import { UserService } from "../users/user.service";
import { Events } from "./entity/Events.entity";
import { Category } from "../category/entity/Category.entity";
import { Users } from "../users/models/Users.entity";
import { NotFoundException } from "../common/errors/http.exceptions";
import { CategoryService } from "../category/category.service";

export class EventsService{
    private eventsRepository: Repository<Events>;
    private userRepository: Repository<Users>;


    constructor(
        private dataSource: DataSource,
        private userService: UserService,
        private categoryService: CategoryService
    ){
        this.eventsRepository = dataSource.getRepository(Events);
        this.userRepository = dataSource.getRepository(Users);
    }

    

    async createEvent(createEventInput: CreateEventInput, userId: number){
        const creatingUser = await this.userService.findOneById(userId);

        if(!creatingUser){
            throw new NotFoundException(`User with ID "${userId}" not found. Cannot create event.`)
        }

        const categories = await this.categoryService.findCategoryListByIds(createEventInput.categoryIds)
        const uniqueCategories = new Set(categories.map(cat => cat.id))

        const uniqueReqCategoryIds = new Set(createEventInput.categoryIds)

        const missingIds = [...uniqueCategories].filter(id => !uniqueReqCategoryIds.has(id))

        if(missingIds.length > 0){
            throw new NotFoundException(`Catergories with ID(s) "${missingIds.join(', ')} do not exist"`)
        }

        const newEvent = this.eventsRepository.create({
            name: createEventInput.name,
            description: createEventInput.description,
            language: createEventInput.language,
            ticketPrice: createEventInput.ticketPrice,
            fromDate: createEventInput.fromDate,
            tillDate: createEventInput.tillDate,
            categories: categories,
            user: creatingUser,
        });
        return await this.eventsRepository.save(newEvent);
    }


}