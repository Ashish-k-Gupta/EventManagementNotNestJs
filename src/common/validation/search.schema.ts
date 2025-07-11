import z from 'zod';
import { PaginationOptionsSchema } from './pagination.schema';
import { FilterOptionsSchema } from './filters.schema';

export const eventSearchOptionsSchema = PaginationOptionsSchema.extend({
    search: z.string().optional(),
    filter: FilterOptionsSchema.optional(),
})
