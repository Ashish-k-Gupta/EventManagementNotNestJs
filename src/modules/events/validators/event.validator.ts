import z from 'zod';

export const BaseSlotSchema = z.object({
    startDate: z.string().datetime({ offset: true }),
    endDate: z.string().datetime({ offset: true }),
    totalSeats: z.number().int().min(1, "Total Seats Cannot be 0"),
    ticketPrice: z.number().nonnegative("Ticket Price Cannot be negative")
});

export const CreateSlotSchema = BaseSlotSchema.superRefine((data, ctx) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate < new Date()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Start date cannot be in the past',
            path: ['startDate']
        });
    }

    if (startDate >= endDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End date must be after start date for a slot',
            path: ['endDate']
        });
    }
});


export const CreateEventSchema = z.object({
    title: z.string().min(3, "Event title must be at least 3 character"),
    description: z.string().min(50, "Event description must be at least 50 characters long"),
    language: z.string().min(2, "Language must be at least 2 characters long"),
    slots: z.array(CreateSlotSchema).min(1, "An event must have at least one time slot."),
    categoryIds: z.array(z.number()),
    venue: z.string().min(1).max(250)
})


export const UpdateSlotSchema = BaseSlotSchema.partial().extend({
    id: z.string().min(1).optional()
});


export const updateEventSchema = CreateEventSchema.partial().extend({
    slots: z.array(UpdateSlotSchema).optional(),
    isCancelled: z.boolean().optional(),
})

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type CreateEventSlotInput = z.infer<typeof CreateSlotSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>;