import { z } from 'zod';
import { CreateEventSchema } from '../../modules/events/validators/event.validator';

export const PaginationOptionsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.string().optional().default('created_at'),
    sortOrder: z.enum(['ASC', 'DESC']).optional().default('DESC')
})

export type PaginationOptions = z.infer<typeof PaginationOptionsSchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) => z.object({
    data: z.array(itemSchema), 
    meta: z.object({
        total: z.number().min(0),
        page: z.number().min(1),
        limit: z.number().min(1),
        totalPages: z.number().min(0),
        hasNext: z.boolean(),
        hasPrevious: z.boolean()
    })
})