import z, { object } from 'zod';

export const PaginationOptionsSchema = z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(10).optional(),
    sortBy: z.string().default('created_at').optional(),
    sortOrder: z.enum(['ASC', 'DESC']).default('DESC').optional()
})
export type paginationOptions = z.infer<typeof PaginationOptionsSchema>;


export const PaginatedResponse = <T extends z.AnyZodObject>(itemSchema: T) =>({
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