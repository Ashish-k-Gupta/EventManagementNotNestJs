import z from 'zod';

export const AddItemToCartSchema = z.object({
    eventSlotId: z.coerce.number(),
    numberOfTickets: z.coerce.number().int().positive(),
});


export const RemoveCartItemSchema = z.object({
    userId: z.string().min(1),
    itemId: z.string().min(1)
})

export type AddCartItem = z.infer<typeof AddItemToCartSchema>;
export type RemoveCartItemd = z.infer<typeof RemoveCartItemSchema>;
