import z from 'zod';
import { Category } from '../../category/entity/Category.entity';
import path from 'path';
import { Code } from 'typeorm';

export const CreateEventSchema = z.object({
    name: z.string().min(3, "Event name must be at least 3 character"),
    description: z.string().min(50, "Event description must be at least 50 characters long"),
    language: z.string().min(2, "Language must be at least 2 characters long"),
    ticketPrice: z.number().min(0, "Ticket price cannot be negative"),
    fromDate: z.string().datetime({offset: true}),
    tillDate: z.string().datetime({offset: true}),
    categoryIds: z.array(z.number().int().positive("category ID must be a positive integer")).min(1, "Event must have at least 1 category")
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

export const updateEventSchema = z.object({
    name: z.string().min(3, "Name should be atleast 3 character long").optional(),
    description: z.string().min(50, "Description should be at least 50 characters long").optional(),
    language: z.string().min(2, "Language should be atleast 2 characters long").optional(),
    ticketPrice: z.number().min(0, "Ticket price can not be negative").optional(),
    fromDate: z.string().datetime({offset: true}).optional(),
    tillDate: z.string().datetime({offset: true}).optional(),
    CategoryIds: z.array(z.number().int().positive("Catergory ID must be a positive integer").min(1, "Event must have at least 1 category").optional()),
    isCancelled: z.boolean().optional(),
}).superRefine((data, ctx) =>{
    const fromDateProvider = typeof data.fromDate === 'string';
    const tillDateProvider = typeof data.tillDate === 'string';

    let parsedFromDate : Date | undefined;
    let parsedTillDate : Date | undefined;

    if(fromDateProvider){
        parsedFromDate = new Date(data.fromDate!);
    }

    if(tillDateProvider){
        parsedTillDate = new Date(data.tillDate!);
    }

    if(fromDateProvider && tillDateProvider){
        if(parsedTillDate! < parsedFromDate!){
            ctx.addIssue({
                code: 'custom',
                message: 'tillDate can not be before fromDate',
                path: ['tillDate'],
            })
        }
    }

    if(fromDateProvider){
        if(parsedFromDate! < new Date()){
            ctx.addIssue({
                code: 'custom',
                message: 'fromDate cannot be in the past',
                path: ['fromDate']
            })
        }
    }
})


export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;