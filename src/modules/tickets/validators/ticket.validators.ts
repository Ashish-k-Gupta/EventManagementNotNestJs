import * as z from 'zod';

export const createTicketSchema = z.object({
    eventId: z.number().int().positive(),
    numberOfTickets: z.number().int().positive().default(1),
    totalPrice: z.number().int().min(0, "Ticket price cannot be negative"),
})

export const updateTicketSchema = z.object({
    ticketId: z.array(z.number().int().positive()),
    isCancelled: z.boolean().refine(val => val === true, {
        message: "To cancel a ticket, 'isCancelled' must be true."
    }).optional()
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

