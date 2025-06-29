export class AppError extends Error{
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number = 500, isOperational: boolean = true){
        super(message)
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundException extends AppError{
    constructor(message: string = "Bad Reqeust"){
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


export class UnauthorizedException extends AppError{
    constructor(message: string = "Not Authorized to access this resource"){
        super(message, 401)
    }
}

export class ForbiddenException extends AppError{
    
    constructor(message: string = "You do not have permission to access this resource."){
        super(message, 403)
    }
}

export class BadRequestException extends AppError{
    constructor(message: string = "You cannot remove all data here"){
        super(message, 400)
    }
}