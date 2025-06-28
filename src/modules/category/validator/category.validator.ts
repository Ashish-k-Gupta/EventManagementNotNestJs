import {TypeOf, z} from 'zod';

export const createCategorySchema = z.object({
    name: z.string().min(3, "category name should be at least 3 characters long").max(20, "category name can not be longer than 20 characters")
})

export const updateCategorySchema = z.object({
    name: z.string().min(3, "category name should be at least 3 characters long").max(20, "category name can not be longer than 20 characters").optional()
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;