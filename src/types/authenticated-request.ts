// src/types/authenticated-request.ts

import { Request } from 'express';
import { PayloadForToken } from '../modules/auth/validator/payload.validator';// Adjust this path based on your project structure

export interface AuthenticatedRequest extends Request {
  user: PayloadForToken;
}