Error.stackTraceLimit = process.env.NODE_ENV === 'development' ? 5 : 0
Error.prepareStackTrace = function(_, stack){

    const errors = []

    stack.forEach(frame => {
        if(frame.getFileName())
            if(!frame.getFileName().includes('node_modules') && !frame.getFileName().includes('node:')) 
                errors.push({
                    fileName: frame.getFileName(),
                    lineNumber: frame.getLineNumber(),
                    functionName: frame.getFunctionName(),
                    typeName: frame.getTypeName()
                })
    })
    
    if(errors.length && process.env.NODE_ENV === 'development') {
        console.log('Stack of Errors:')
        console.table(errors)
    }
}

export class ErrorHandler extends Error {
    constructor(message, statusCode){
        super(message)
        this.statusCode = statusCode

        Error.captureStackTrace(this,this.constructor)
    }
}