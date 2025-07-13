import z from 'zod';
import { PaginationOptionsSchema } from './commonPagination.schema';
import { FilterOptionsSchema } from './commonFilterSchema ';

export const eventSearchOptionsSchema = PaginationOptionsSchema.extend({
    search: z.string().optional(),
    filter: FilterOptionsSchema.optional(),
})
