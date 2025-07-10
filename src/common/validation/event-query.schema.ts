import z from 'zod';

export const EventQueryParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
  search: z.string().optional(),
  // Filter parameters (flattened for query params)
  category: z.string().optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
}).refine(
  (data) => {
    if (data.priceMin && data.priceMax) {
      return data.priceMin <= data.priceMax;
    }
    return true;
  },
  {
    message: "Minimum price cannot be greater than maximum price",
    path: ["priceMin"],
  }
).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: "Start date cannot be after end date",
    path: ["startDate"],
  }
);