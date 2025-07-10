import z from 'zod';

export const EventFilterSchema = z.object({
    category: z.string().optional(),
    language: z.string().optional(),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional(),
    priceMin: z.coerce.number().min(0).optional(),
    priceMax: z.coerce.number().min(0).optional()
}).superRefine(
    (data, ctx) => {
      if (
        typeof data.priceMin === 'number' &&
        typeof data.priceMax === 'number' &&
        data.priceMin > data.priceMax
      ) {
        ctx.addIssue({
            code: 'custom', 
            message: 'Min Price cannot be less then Max price',
            path: ['minPrice']
        })
      }
    }, 
   
).superRefine(
    (data, ctx) => {
        if (data.startDate && data.endDate) {
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);
            if (startDate < endDate) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'tillDate cannot be before fromDate',
                    path: ['tillDate']
                });
            }
        }
    }
)