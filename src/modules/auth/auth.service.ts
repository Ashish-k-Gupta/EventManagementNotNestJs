import { UserService } from "../users/user.service";
import dotenv from 'dotenv';
import jwt, { SignOptions } from 'jsonwebtoken'
import { NotFoundException } from "../common/errors/http.exceptions";
import { CreateUserInput, LoginUserInput } from "../users/validators/user.validators";
import { Users } from "../users/models/Users.entity";
import { PayloadForToken } from "./validator/payload.validator";
import { loginSchema } from "./validator/login.validator";

type UserWithoutPassword = Omit<Users, 'password' | 'setCreatedBy' | 'setUpdatedBy'>;

dotenv.config();
const secretKey = process.env.JWT_SECRET as string;
const jwtExpiresIn = parseInt(process.env.JWT_EXPIRES_IN!) || 3600;

if (!secretKey) {
    throw new NotFoundException("Secret key is missing")
}
export class AuthService {

    constructor(private userService: UserService) { }

    async generateToken(payload: PayloadForToken): Promise<{ token: string }> {
        const signOptions: SignOptions = { expiresIn: jwtExpiresIn };
        const token = jwt.sign(payload, secretKey, signOptions);
        return { token };
    }

    async registerUser(createUserInput: CreateUserInput): Promise<{ token: string, user: Partial<Users> }> {
        const user = await this.userService.createUser({ body: createUserInput });
        const payload = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        };
        const signOptions: SignOptions = {
            expiresIn: jwtExpiresIn
        };

        const Jwt_token = jwt.sign(payload, secretKey, signOptions);
        return {
            user: user,
            token: Jwt_token,
        }

    }

    async login(loginUserInput: LoginUserInput): Promise<{ token: string, user: UserWithoutPassword }> {
        const ValidUser = await this.userService.validateUser(loginUserInput);
        const { password, ...userWithoutPassword } = ValidUser;
        const { id, email, firstName, lastName, role } = userWithoutPassword;
        const payload = { id, email, firstName, lastName, role };
        const { token } = await this.generateToken(payload);

        return {
            user: userWithoutPassword,
            token: token,
        }
    }
}