import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 character"),
})

export const loginSchemaNew = z.object({
    query: z.object({}).optional(),
    body: loginSchema
})