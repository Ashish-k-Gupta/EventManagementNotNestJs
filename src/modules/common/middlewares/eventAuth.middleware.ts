// import { NextFunction, Request, Response } from "express";
// import { ForbiddenException, UnauthorizedException } from "../errors/http.exceptions";

// export const checkEventOwnershipOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         if (!req.user || req.user.id === undefined || req.user.id === null || !req.user.role) {
//             throw new UnauthorizedException("Authentication required. User data not found in token.");
//             const eventId = parseInt(req.params.id, 10);
//             if (isNaN(eventId)) {
//                 throw new ForbiddenException("Invalid event Id in URL.")
//             }
//         }
//     } catch (err) {
//         next(err)
//     }
// }