import { DataSource, Repository } from "typeorm";
import { BadRequestException, ConflictException, ForbiddenException, InvalidCredentialsException, NotFoundException } from "../common/errors/http.exceptions";
import * as bcrypt from 'bcrypt'
import { z } from "zod";
import { createUserSchema, updateUserSchema, updatePasswordSchema } from "./validators/user.validators";
import { Users } from "./models/Users.entity";
import * as crypto from 'node:crypto'
import { PasswordResetToken } from "./models/PasswordResetToken.entity";
import { RESET_TOKEN_STATUS } from "./enums/ResetTokenStatus.enum";
import { EmailService } from "../../common/service/email.service";
import { loginSchema } from "../auth/validator/login.validator";


type CreateUserInput = z.infer<typeof createUserSchema>
type UpdateUserInput = z.infer<typeof updateUserSchema>
type updatePasswordInput = z.infer<typeof updatePasswordSchema>
type LoginUserInput = z.infer<typeof loginSchema>


export class UserService {

    private userRepository: Repository<Users>;
    private passwordResetTokenRepository: Repository<PasswordResetToken>;
    constructor(private dataSource: DataSource) {
        this.userRepository = dataSource.getRepository(Users);
        this.passwordResetTokenRepository = dataSource.getRepository(PasswordResetToken);
    }

    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }



    async createUser(createUserData: CreateUserInput): Promise<Partial<Users>> {
        const existingMail = await this.userRepository.findOne({ where: { email: createUserData.body.email } })
        if (createUserData.body.role === "admin") {
            throw new ForbiddenException("Admin role is not allowed")
        }
        if (existingMail) {
            throw new ConflictException(`Eamil already exists.`)
        }

        const hashPassword = await this.hashPassword(createUserData.body.password)

        const newUser = this.userRepository.create({
            firstName: createUserData.body.firstName,
            lastName: createUserData.body.lastName,
            email: createUserData.body.email.toLowerCase(),
            password: hashPassword,
            role: createUserData.body.role,
        })
        const savedUser = await this.userRepository.save(newUser);
        const { password, deleted_at, updated_at, created_by, ...safeUser } = savedUser;
        return safeUser;
    }

    async findUserByEmail(email: string): Promise<Users | null> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email })
            .getOne()
        return user || null;
    }

    async findOneById(id: number): Promise<Users> {
        const user = await this.userRepository.findOne({ where: { id } })
        if (!user) {
            throw new NotFoundException(`User with ID "${id}" not found`);
        }
        return user;
    }

    async findAll() {
        return await this.userRepository.find();
    }

    async softRemove(id: number): Promise<void> {
        const existingUser = await this.userRepository.findOne({ where: { id } })
        if (!existingUser) {
            throw new NotFoundException('User not found')
        }
        await this.userRepository.softRemove(existingUser)
    }

    async updateUser(id: number, updateUserData: UpdateUserInput): Promise<Users> {

        const user = await this.findOneById(id);
        if (updateUserData.body.email && updateUserData.body.email !== user.email) {
            const existingUserWithEmail = await this.userRepository.findOne({
                where: { email: updateUserData.body.email }
            })
            if (existingUserWithEmail && existingUserWithEmail.id !== user?.id) {
                throw new ConflictException('Email already in use by another user.');
            }
        }
        Object.assign(user, updateUserData)
        return this.userRepository.save(user)
    }

    async updatePassword(id: number, updatePasswordData: updatePasswordInput): Promise<boolean> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.id = :id', { id })
            .getOne();

        if (!user) {
            throw new NotFoundException(`User with ID "${id}" not found.`);
        }

        const isPasswordValid = await bcrypt.compare(updatePasswordData.oldPassword, user.password);
        if (!isPasswordValid) {
            throw new InvalidCredentialsException("Old password does not match.")
        }

        user.password = await this.hashPassword(updatePasswordData.newPassword)
        await this.userRepository.save(user);
        return true;
    }

    async validateUser(loginUserInput: LoginUserInput): Promise<Users> {
        const { email, password } = loginUserInput;
        const user = await this.userRepository.findOne({
            where: { email: email },
            select: ["id", "firstName", "lastName", "email", "role", "password"]
        }
        );

        if (!user) {
            throw new NotFoundException(`User with ID "${email}" not found.`);
        }
        const isPasswordValid = await bcrypt.compare(password, user.password,);
        if (!isPasswordValid) {
            throw new InvalidCredentialsException("Email or password incorrect");
        }
        return user;
    }


    async resetPassword(userEmail: string, emailService: EmailService): Promise<string> {
        const resetUser = await this.userRepository.findOne({ where: { email: userEmail } });
        if (!resetUser) {
            throw new BadRequestException('If user exist password reset link sent successfully. Please check your email.');
        }
        await this.passwordResetTokenRepository.update(
            {
                user: resetUser,
                tokenStatus: RESET_TOKEN_STATUS.IS_VALID
            },
            {
                tokenStatus: RESET_TOKEN_STATUS.INVALIDATED
            })

        const token_expiry_time = new Date(new Date().getTime() + 15 * 60 * 1000);
        const resetToken = crypto.randomBytes(32).toString('hex');

        const port = process.env.SERVER_PORT || 3000;
        const frontendBaseUrl = process.env.FRONTEND_URL || `http://localhost:${port}`;
        const resetUrl = `${frontendBaseUrl}/users/confirm-reset-password?token=${resetToken}`

        const newToken = this.passwordResetTokenRepository.create({
            token: resetToken,
            expiry_time: token_expiry_time,
            user: resetUser
        })
        await this.passwordResetTokenRepository.save(newToken);
        await emailService.resetPasswordRequest(userEmail, resetUrl)
        return 'Password reset link sent successfully. Please check your email.'

    }

    async confirmResetPassword(reqToken: string, newPassword: string): Promise<{ message: string }> {
        const validToken = await this.passwordResetTokenRepository.findOne({
            where: { token: reqToken },
            relations: ['user']
        });

        if (!validToken) {
            throw new BadRequestException('Invalid or expired token')
        }
        if (validToken.tokenStatus !== 'isValid') {
            throw new BadRequestException('Invalid or expired token')
        }
        const now = new Date();
        if (validToken.expiry_time < now) {
            validToken.tokenStatus = RESET_TOKEN_STATUS.EXPIRED;
            await this.passwordResetTokenRepository.save(validToken)
            throw new BadRequestException('Invliad or expired token')
        }


        const salt = await bcrypt.genSalt(10)
        const newHashedPasswod = await bcrypt.hash(newPassword, salt);

        const userToUpdate = validToken.user;
        if (!userToUpdate) {
            throw new BadRequestException('Something went wrong')
        }
        userToUpdate.password = newHashedPasswod;
        await this.userRepository.save(userToUpdate);

        validToken.tokenStatus = RESET_TOKEN_STATUS.USED;
        await this.passwordResetTokenRepository.save(validToken);

        return { message: "Password reset successfully" }
    }
}
