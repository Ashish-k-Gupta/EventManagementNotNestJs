#6-20-2025

I'm leaving it here, I was just writing dto of createUser, other dto for updateUser and update password is pending, 

Then Also user service and controller also pending.

Category enitity pending

Haven't started any other service or controller yet.

#6-24-2025
I had decided that I will use zod instead of class-validator and class-transform.
I was able to implement that in the userService.
Then I had to create a validation.middleware file. (I have to see this again, how does one write this. What is exact purpose of it. I have a rought idea but I don't know it throughly.) ([x]Pending Task)

## Then I have started writing userController, goto line 23 in user controller file  ([x]Pending Task)
## I have write router after that ( [x] Pending Task)
## Also go to know that you can apply validation on query and param as well. That is news to me. Need to dig deeper on that.

Below I have written the code from LLM, because I didn't wanted to miss on this logic, later I will look into this for reference.

```typescript

import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { createUserSchema, updateUserSchema, updatePasswordSchema } from '../validators/user.validators';
import { z } from 'zod';

export class UserController {
  constructor(private userService: UserService) {}

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const user = await this.userService.createUser(validatedData);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  };

  findUserByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.params;
      const user = await this.userService.findUserByEmail(email);
      res.json(user);
    } catch (err) {
      next(err);
    }
  };

  findOneById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const user = await this.userService.findOneById(id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  };

  findAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.findAll();
      res.json(users);
    } catch (err) {
      next(err);
    }
  };

  softRemove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await this.userService.softRemove(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const validatedData = updateUserSchema.parse(req.body);
      const updatedUser = await this.userService.updateUser(id, validatedData);
      res.json(updatedUser);
    } catch (err) {
      next(err);
    }
  };

  updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const validatedData = updatePasswordSchema.parse(req.body);
      const success = await this.userService.updatePassword(id, validatedData);
      res.json({ success });
    } catch (err) {
      next(err);
    }
  };
}

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateSchema } from '../../../common/middlewares/validateSchema';
import {
  createUserSchema,
  updateUserSchema,
  updatePasswordSchema,
} from '../validators/user.validators';
import { AppDataSource } from '../../../data-source'; // your DB connection
import { UserService } from '../services/user.service';

const router = Router();
const userService = new UserService(AppDataSource);
const userController = new UserController(userService);

// 🔒 Validate inputs using your middleware
router.post('/', validateSchema(createUserSchema), userController.createUser);
router.get('/:id', userController.findOneById);
router.get('/email/:email', userController.findUserByEmail);
router.get('/', userController.findAll);
router.delete('/:id', userController.softRemove);
router.put('/:id', validateSchema(updateUserSchema), userController.updateUser);
router.patch('/:id/password', validateSchema(updatePasswordSchema), userController.updatePassword);

export default router;

