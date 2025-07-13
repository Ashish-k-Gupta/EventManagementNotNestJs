import z from 'zod';
import { PaginationOptionsSchema } from "./commonPagination.schema";
import { UserRolesArray } from '../../modules/users/enums/UserRole.enum';

const userRole = UserRolesArray;
export const userQuerySchema = PaginationOptionsSchema.extend({
    search: z.string().optional(),
    filter: z.enum(UserRolesArray).optional()
})