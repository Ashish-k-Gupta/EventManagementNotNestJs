import {z} from 'zod';
import { UserRolesArray } from '../enums/UserRole.enum';


export const createUserSchema = z.object({
    firstName: z.string().min(3, "FirstName must be at least 3 character").max(20, "First Name can not exceed length of 20 character"),
    lastName: z.string().min(3, "Last Name must be at least 3 character").max(20, "First Name can not exceed length of 20 character"),
    email: z.string().email("Invalid email format").toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 character").max(20, "Password can not exceed length of 20 character"),
    role: z.enum(UserRolesArray).optional()
})


export const updateUserSchema = z.object({
    firstName: z.string().min(3, "FirstName must be at least 3 character").max(20, "First Name can not exceed length of 20 character").optional(),
    lastName: z.string().min(3, "Last Name must be at least 3 character").max(20, "First Name can not exceed length of 20 character").optional(),
    email: z.string().email("Invalid email format").toLowerCase().optional(),
    role: z.enum(UserRolesArray).optional()
}).refine(data => Object.values(data).some(value => value !== undefined && value !== null && value !== ""), 
    {
        message: "At least one non-empty field must be changed.",
    })

export const updatePasswordSchema = z.object({
    oldPassword: z.string().min(1, "Old Password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 character").max(20, "Password can not exceed length of 20 character")
}).refine(data => data.oldPassword !== data.newPassword,
    {
        message: "New Password cannot be the same as the old password.",
        path: ["oldPassword"]
    }
)

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginUserInput = z.infer<typeof createUserSchema>;