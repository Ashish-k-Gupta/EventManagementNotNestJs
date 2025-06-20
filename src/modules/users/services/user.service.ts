import { DataSource, Repository } from "typeorm";
import { Users } from "../models/Users.entity";
import { AppDataSource } from "../../../AppDataSource";
import { NotFoundException } from "../../common/errors/http.exceptions";
import * as bcrypt from 'bcrypt'

export class UserService{
    private userRepository: Repository<Users>;
    constructor(dataSource: DataSource){
        this.userRepository = AppDataSource.getRepository(Users)
    }

    private async hashPassword(password: string): Promise<string>{
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    async createUser()




    async findOneById(id: number): Promise<Users | null>{
        const user = this.userRepository.findOne({where: {id}})
        if(!user){
            throw new NotFoundException(`User with ID "${id}" not found`);
        }
        return user;
    }
}