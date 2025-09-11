import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";

// Define a type for your validation schemas
interface ValidationSchemas {
    body?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    params?: z.ZodTypeAny;
}

export const validateSchema = (schemas: ValidationSchemas) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schemas.body) {
                schemas.body.parse(req.body);
            }
            if (schemas.query) {
                schemas.query.parse(req.query);
            }
            if (schemas.params) {
                schemas.params.parse(req.params);
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessage = error.errors.map((issue: any) => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                }));
                res.status(StatusCodes.BAD_REQUEST).json({
                    error: "Validation Failed",
                    details: errorMessage,
                });
                return;
            } else {
                next(error);
            }
        }
    };