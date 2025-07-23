import { Request, Response, NextFunction } from "express";
import {z, ZodError} from 'zod';
import { StatusCodes } from "http-status-codes";

type AnyZodObject = z.ZodObject<any> | z.ZodEffects<any, any, any>;
export const validateSchema = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) =>{
    try{
      schema.parse({

       body: req.body,
       query: req.query,
       params: req.params,
       });
       next()
    }catch(error){
        if(error instanceof ZodError){
            const errorMessage = error.errors.map((issue: any) =>({
                path: issue.path.join('.'),
                message: issue.message,
            }))
            res.status(StatusCodes.BAD_REQUEST).json({
                error: "Validation Failed",
                details: errorMessage,
            })
           return;
        }else{
            next(error);
        }
    }
}