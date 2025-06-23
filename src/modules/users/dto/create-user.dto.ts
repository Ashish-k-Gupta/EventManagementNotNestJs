import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";
import { UserRoles } from "../enums/UserRole.enum";

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

    @IsEnum({
    type: 'enum',
    enum: UserRoles,
    default: UserRoles.ATTENDEE
    })
    role!: UserRoles;
}