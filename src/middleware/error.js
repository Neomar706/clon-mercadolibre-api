import { ErrorHandler } from '../utils/errorHandler'

export const errorMiddleware = function(err, req, res, next){
    err.statusCode ||= 500
    err.message ||= 'Internal Server Error'

    if(err.name === 'JsonWebTokenError'){
        const message = 'Token de acceso inválido'
        err = new ErrorHandler(message, 400)
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'El token de acceso expiró'
        err = new ErrorHandler(message, 400);
    }

    if(err.message === 'connect ECONNREFUSED ::1:3306'){
        const message = 'Error al conectar la base de datos'
        err = new ErrorHandler(message, 500)
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}