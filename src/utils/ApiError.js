class ApiError extends Error {
    constructor(
        statusCode,
        message = "Somethign went wrong!!!",
        errors = [],
        stack = ""
    ){
        super(message);
        this.statusCode = statusCode;
        this.stack = stack;
        this.data = null;
        this.message = message;
        this.errors = errors;
        this.success = false;

        if(stack){
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;