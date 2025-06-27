import z from 'zod';

export const CreateEventSchema = z.object({
    name: z.string().min(3, "Event name must be at least 3 character"),
    description: z.string().min(3, "Event description must be at least 3 character"),
    language: z.string().min(2, "Language must be at least 2 character"),
    ticketPrice: z.number().min(0, "Ticket price cannot be negative"),
    fromDate: z.string().refine(val => !isNaN(Date.parse(val)),{
        message: 'Invalid Date Format'
    }),
    tillDate: z.string().refine(val => !isNaN(Date.parse(val)),{
        message: "Invalid Date format"
    }),
    category: z.array(z.string().min(3, "category name must be at least 3 character")).min(1, "Event must have at least 1 category")
}).superRefine((data,ctx) =>{
    const fromDate = new Date(data.fromDate);
    const tillDate = new Date(data.tillDate);

    if(tillDate < fromDate){
        ctx.addIssue({
            code: 'custom',
            message: 'tillDate cannot be before fromDate',
            path: ['tillDate']
        })
    }

    if(fromDate < new Date()){
        ctx.addIssue({
            code: 'custom',
            message: 'fromDate cannot be in the past',
            path: ['fromDate']
        })
    }
})

export const UpdateEventSchema = z.object({
 name: z.string().min(3, "Event name must be at least 3 character").optional(),
    description: z.string().min(3, "Event description must be at least 3 character").optional(),
    language: z.string().min(2, "Language must be at least 2 character").optional(),
    ticketPrice: z.number().min(0, "Ticket price cannot be negative").optional(),
    fromDate: z.string().refine(val => !isNaN(Date.parse(val)),{
        message: 'Invalid Date Format'
    }).optional(),
    tillDate: z.string().refine(val => !isNaN(Date.parse(val)),{
        message: "Invalid Date format"
    }).optional(),
    category: z.array(z.string().min(3, "category name must be at least 3 character")).min(1, "Event must have at least 1 category").optional(),

    isCancelled: z.boolean().optional(),

}).superRefine((data,ctx) =>{
    const fromDateProvided  = typeof data.fromDate === 'string';
    const tillDateProvided  = typeof data.tillDate === 'string';
    
    let parsedFromDate: Date | undefined;
    let parsedTillDate: Date | undefined;

    if(fromDateProvided){
        parsedFromDate = new Date(data.fromDate!);
    }
    if(tillDateProvided){
        parsedTillDate = new Date(data.tillDate!);
    }






    

    if (fromDateProvided && tillDateProvided) {
    if(parsedTillDate! < parsedFromDate!){
        ctx.addIssue({
            code: 'custom',
            message: 'tillDate cannot be before fromDate',
            path: ['tillDate']
        })
    }
    }

    if (fromDateProvided) {
        const now = new Date();
        now.setHours(0,0,0,0);
    if(parsedFromDate && parsedFromDate < now){
        ctx.addIssue({
            code: 'custom',
            message: 'fromDate cannot be in the past',
            path: ['fromDate']
        })
    }
}
})





export type CreateEventInput = z.infer<typeof CreateEventSchema>;