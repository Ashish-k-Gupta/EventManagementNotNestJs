import z from 'zod';
import { PaginationOptionsSchema } from './pagination.schema';
import { EventFilterSchema } from './filters.schema';

export const eventSearchOptionsSchema = PaginationOptionsSchema.extend({
    search: z.string().optional(),
    filter: EventFilterSchema.optional(),
})