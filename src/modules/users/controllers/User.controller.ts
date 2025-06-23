import { UserService } from "../services/user.service";

export class UserController{
    constructor(private userService: UserService){}
}