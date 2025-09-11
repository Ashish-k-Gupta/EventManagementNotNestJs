import { z } from 'zod';
import { USER_ROLE, UserRolesArray } from '../enums/UserRole.enum';


export const createUserBodySchema = z.object({
    firstName: z.string().min(3, "FirstName must be at least 3 character").max(20, "First Name can not exceed length of 20 character"),
    lastName: z.string().min(3, "Last Name must be at least 3 character").max(20, "First Name can not exceed length of 20 character"),
    email: z.string().email("Invalid email format").toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 character").max(20, "Password can not exceed length of 20 character"),
    role: z.enum(UserRolesArray).optional()
})

export const createUserSchema = z.object({
    body: createUserBodySchema,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
})

const updateUserBodySchema = z.object({
    firstName: z.string().min(3, "FirstName must be at least 3 character").max(20, "First Name can not exceed length of 20 character").optional(),
    lastName: z.string().min(3, "Last Name must be at least 3 character").max(20, "First Name can not exceed length of 20 character").optional(),
    email: z.string().email("Invalid email format").toLowerCase().optional(),
    role: z.enum([USER_ROLE.ATTENDEE, USER_ROLE.ORGANIZER]).optional()
})
    .refine(data => Object.values(data).some(value => value !== undefined && value !== null && value !== ""),
        {
            message: "At least one non-empty field must be changed.",
        })

export const updateUserSchema = z.object({
    body: updateUserBodySchema,
    query: z.object({}).optional(),
    params: z.object({}).optional(),
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

const emailRequestSchema = z.object({
    email: z.string().email().min(1, "Must provide a valid email")
})

export const requestNewPasswordSchema = z.object({
    body: emailRequestSchema,
    query: z.object({}).optional(),
    params: z.object({}).optional()
})

const resetPasswordQueryParamSchema = z.object({
    token: z.string({
        required_error: 'Password reset token is missing from the URL',
        invalid_type_error: 'Password reset token must be a string',
    }).min(1, 'Password reset token cannot be empty.')
})

const resetPasswordBodySchema = z.object({
    newPassword: z.string({
        required_error: 'New Password is required',
        invalid_type_error: 'New password must be a string.'
    }).min(8, 'New password be at least 8 characters long.')
        .regex(/[A-Z]/, ' New password must contains at least one uppercase letter')
        .regex(/[a-z]/, ' New password must contains at least one lowercase letter')
        .regex(/[0-9]/, ' New password must contains at least one number')
        .regex(/[^a-zA-Z0-9]/, ' New password must contains at least one special character.'),
    confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Password don't match",
    path: ['confirmNewPassword']
})

export const confirmResetPasswordSchema = z.object({
    query: resetPasswordQueryParamSchema,
    body: resetPasswordBodySchema
})


export type CreateUserInput = z.infer<typeof createUserBodySchema>;
export type LoginUserInput = z.infer<typeof createUserBodySchema>;