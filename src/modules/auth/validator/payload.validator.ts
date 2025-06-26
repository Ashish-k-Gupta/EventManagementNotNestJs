import {z} from 'zod';
import { UserRolesArray } from '../../users/enums/UserRole.enum';

export const tokenPayloadSchema = z.object({
    id: z.number(),
    email: z.string().email("Invalid email format"),
    firstName: z.string(),
    lastName: z.string(),
    role: z.enum(UserRolesArray)
});


export type PayloadForToken = z.infer<typeof tokenPayloadSchema>;