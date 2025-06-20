import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";

export class CreateUserDto{

    @IsString()
    @IsNotEmpty()
    @Length(1, 50)
    username!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;


}