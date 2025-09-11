import z from 'zod';

export const CreateSlotSchema = z.object({
    startDate: z.string().datetime({ offset: true }),
    endDate: z.string().datetime({ offset: true }),
    totalSeats: z.number().min(1, "Total Seats Cannot be 0"),
    ticketPrice: z.number().min(0, "Ticket Price Cannot be negative")
}).superRefine((data, ctx) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate < new Date()) {
        ctx.addIssue({
            code: 'custom',
            message: 'Start date cannot be in the past',
            path: ['startDate']
        })
    }

    if (startDate > endDate) {
        ctx.addIssue({
            code: 'custom',
            message: 'End date cannot be before start date for a slot',
            path: ['endDate']
        })
    }
})

export const CreateEventSchema = z.object({
    title: z.string().min(3, "Event title must be at least 3 character"),
    description: z.string().min(50, "Event description must be at least 50 characters long"),
    language: z.string().min(2, "Language must be at least 2 characters long"),
    slots: z.array(CreateSlotSchema).min(1, "An event must have at least one time slot."),
    categoryIds: z.array(z.number().int().positive("category ID must be a positive integer")).min(1, "Event must have at least 1 category")
})

export const updateEventSchema = z.object({
    title: z.string().min(3, "Name should be atleast 3 character long").optional(),
    description: z.string().min(50, "Description should be at least 50 characters long").optional(),
    language: z.string().min(2, "Language should be atleast 2 characters long").optional(),
    ticketPrice: z.number().min(0, "Ticket price can not be negative").optional(),
    startDate: z.string().datetime({ offset: true }).optional(),
    endDate: z.string().datetime({ offset: true }).optional(),
    CategoryIds: z.array(z.number().int().positive("Catergory ID must be a positive integer").min(1, "Event must have at least 1 category").optional()),
    isCancelled: z.boolean().optional(),
}).superRefine((data, ctx) => {
    const startDateProvider = typeof data.startDate === 'string';
    const endDateProvider = typeof data.endDate === 'string';

    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDateProvider) {
        parsedStartDate = new Date(data.startDate!);
    }

    if (endDateProvider) {
        parsedEndDate = new Date(data.endDate!);
    }

    if (startDateProvider && endDateProvider) {
        if (parsedEndDate! < parsedStartDate!) {
            ctx.addIssue({
                code: 'custom',
                message: 'End Date can not be before start Date',
                path: ['endDate'],
            })
        }
    }

    if (startDateProvider) {
        if (parsedStartDate! < new Date()) {
            ctx.addIssue({
                code: 'custom',
                message: 'Start Date cannot be in the past',
                path: ['startDate']
            })
        }
    }
})


export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type CreateEventSlotInput = z.infer<typeof CreateSlotSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>;