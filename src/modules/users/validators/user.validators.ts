import {z} from 'zod';
import { UserRolesArray } from '../enums/UserRole.enum';


export const createUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 character"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 character"),
    role: z.enum(UserRolesArray).optional()
})


export const updateUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 character").optional(),
    email: z.string().email("Invalid email format").optional(),
    password: z.string().min(8, "Password must be at least 8 character").optional(),
    role: z.enum(UserRolesArray).optional()
}).refine(data => Object.values(data).some(value => value !== undefined && value !== null && value !== ""), 
    {
        message: "At least one non-empty field must be changed.",
    })

export const updatePasswordSchema = z.object({
    oldPassword: z.string().min(1, "Old Password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 character")
}).refine(data => data.oldPassword !== data.newPassword,
    {
        message: "New Password cannot be the same as the old password.",
        path: ["newPassword"]
    }
)

