export class AppError extends Error{
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number = 500, isOperaional: boolean = true){
        super(message)
        this.statusCode = statusCode;
        this.isOperational = isOperaional;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundException extends AppError{
    constructor(message: string = "Resource not found"){
        super(message, 404);
    }
}

export class ConflictException extends AppError{
    constructor(message: string = "Conflict with existing resource"){
        super(message, 409);
    }
}

export class InvalidCredentialsException extends AppError{
    constructor(message: string = "Invalid Credentials"){
        super(message, 401)
    }
}