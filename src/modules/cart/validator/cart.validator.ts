import z from 'zod';


export const AddItemToCartSchema = z.object({
    eventSlotId: z.string(),
    numberOfTickets: z.number().int().positive("Quantity must be a positive number"),
})

export const RemoveCartItemSchema = z.object({
    userId: z.string().min(1),
    itemId: z.string().min(1)
})

export type AddCartItem = z.infer<typeof AddItemToCartSchema>;
export type RemoveCartItemd = z.infer<typeof RemoveCartItemSchema>;
