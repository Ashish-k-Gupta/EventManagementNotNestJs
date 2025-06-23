import { DataSource, Repository } from "typeorm";
import { Users } from "../models/Users.entity";
import { AppDataSource } from "../../../AppDataSource";
import { ConflictException, NotFoundException } from "../../common/errors/http.exceptions";
import * as bcrypt from 'bcrypt'
import { CreateUserDto } from "../dto/create-user.dto";

export class UserService{
    private userRepository: Repository<Users>;
    constructor(private dataSource: DataSource){
        this.userRepository = dataSource.getRepository(Users)
    }

    private async hashPassword(password: string): Promise<string>{
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    async createUser(createUserDto: CreateUserDto):Promise<Users>{
        const existingMail =await this.userRepository.findOne({where: {email: createUserDto.email}})
        if(existingMail){
            throw new ConflictException(`Eamil already exists.`)
        }
        const hashPassword = await this.hashPassword(createUserDto.password)
        const newUser = this.userRepository.create({
            username: createUserDto.username,
            email: createUserDto.email,
            password: hashPassword,
            role: createUserDto.role,
        })
        return await this.userRepository.save(newUser);
    }

    async findUserByEmail(email: string):Promise<Users>{
        const existingUserByEmail = await this.userRepository.findOne({where: {email}})
        if(!existingUserByEmail){
            throw new NotFoundException(`User does not exists.`)
        }
        return existingUserByEmail;
    }

    async findOneById(id: number): Promise<Users | null>{
        const user = this.userRepository.findOne({where: {id}})
        if(!user){
            throw new NotFoundException(`User with ID "${id}" not found`);
        }
        return user;
    }

    async findAll(){
        return await this.userRepository.find();
    }

    async softRemove(id: number):Promise<void>{
        const existingUser = await this.userRepository.findOne({where:{id}})
        if(!existingUser){
            throw new NotFoundException('User not found')
        }
        await this.userRepository.softRemove(existingUser)
    }
}
