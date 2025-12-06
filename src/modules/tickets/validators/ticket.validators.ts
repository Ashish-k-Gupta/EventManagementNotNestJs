import * as z from 'zod';

export const createTicketSchema = z.object({
    slotId: z.string(),
    numberOfTickets: z.number().int().positive().default(1),
    totalPrice: z.number().int().min(0, "Ticket price cannot be negative"),
})

export const updateTicketSchema = z.object({
    ticketId: z.array(z.string()),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;