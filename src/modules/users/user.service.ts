import { DataSource, Repository } from "typeorm";
import { ConflictException, ForbiddenException, InvalidCredentialsException, NotFoundException } from "../common/errors/http.exceptions";
import * as bcrypt from 'bcrypt'
import {z} from "zod";
import { createUserSchema, updateUserSchema, updatePasswordSchema } from "./validators/user.validators";
import { loginSchema } from "../auth/validator/login.validator";
import { Users } from "./models/Users.entity";


type CreateUserInput = z.infer<typeof createUserSchema>
type UpdateUserInput = z.infer<typeof updateUserSchema>
type updatePasswordInput = z.infer<typeof updatePasswordSchema>
type LoginUserInput = z.infer<typeof loginSchema>


export class UserService{

    private userRepository: Repository<Users>;
    constructor(private dataSource: DataSource){
        this.userRepository = dataSource.getRepository(Users)
    }

    private async hashPassword(password: string): Promise<string>{
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }



    async createUser(createUserData: CreateUserInput):Promise<Partial<Users>>{
        const existingMail =await this.userRepository.findOne({where: {email: createUserData.email}})
        if(createUserData.role === "admin"){
            throw new ForbiddenException("Admin role is not allowed")
        }
        if(existingMail){
            throw new ConflictException(`Eamil already exists.`)
        }

        const hashPassword = await this.hashPassword(createUserData.password)
        
        const newUser = this.userRepository.create({
            firstName: createUserData.firstName,
            lastName: createUserData.lastName,
            email: createUserData.email.toLowerCase(),
            password: hashPassword,
            role: createUserData.role,
        })
        const savedUser = await this.userRepository.save(newUser);
        const {password, deleted_at, updated_at, created_by, ...safeUser} = savedUser;
        return safeUser;
    }

    async findUserByEmail(email: string):Promise<Users | null>{
        const user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.email = :email', {email})
        .getOne()
        return user || null;
    }

    async findOneById(id: number): Promise<Users>{
        const user = await this.userRepository.findOne({where: {id}})
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

    async updateUser(id: number, updateUserData: UpdateUserInput):Promise<Users>{
        const user = await this.findOneById(id);
        if(updateUserData.email && updateUserData.email !== user.email){
            const existingUserWithEmail = await this.userRepository.findOne({
                where: {email: updateUserData.email}
            })
            if(existingUserWithEmail &&  existingUserWithEmail.id !== user?.id){
                throw new ConflictException('Email already in use by another user.');
            }
        }
        Object.assign(user, updateUserData)
        return this.userRepository.save(user)
    }

    async updatePassword(id: number, updatePasswordData: updatePasswordInput): Promise<boolean>{
        const user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.id = :id', {id})
        .getOne();

        if(!user){
            throw new NotFoundException(`User with ID "${id}" not found.`);
        }

        const isPasswordValid = await bcrypt.compare(updatePasswordData.oldPassword, user.password);
        if(!isPasswordValid){
            console.log("Invalid Password")
            throw new InvalidCredentialsException("Old password does not match.")
        }

        user.password = await this.hashPassword(updatePasswordData.newPassword)
        await this.userRepository.save(user);
        return true;
    }

    async validateUser(loginUserInput: LoginUserInput): Promise<Users>{
        const {email, password} = loginUserInput;
        const user = await this.findUserByEmail(email);
        if(!user || !(await bcrypt.compare(password, user.password))){
            throw new InvalidCredentialsException("Email or password incorrect")
        }
        return user;
    }
}
