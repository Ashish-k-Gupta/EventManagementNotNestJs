import z from 'zod';

export const FilterOptionsSchema = z.object({
    title: z.string().optional(),
    language: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    startDate: z.string().date().optional(),
    endDate: z.string().date().optional()
}).superRefine((data, ctx) =>{
    if(data.startDate && data.endDate){
        const parsedStartDate = new Date(data.startDate);
        const parsedEndDate = new Date(data.endDate)

        if(parsedStartDate > parsedEndDate){
            ctx.addIssue({
                code: "custom",
                message:"Start date cannot be after end date",
                path: ['startDate']
            })
        }
    }

      if(data.minPrice && data.maxPrice){

        if(data.minPrice > data.maxPrice){
            ctx.addIssue({
                code: 'custom', 
                message: 'Min price cannot be more than max price',
                path: ['minPrice']
            })
        }
    }
})