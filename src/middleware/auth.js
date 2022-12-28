import jwt from 'jsonwebtoken'
import { catchAsyncErrors } from './catchAsyncErrors'
import { ErrorHandler } from '../utils/errorHandler'
import { pool } from '../config/database'


export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    if(req.user) return next()

    const token = req.cookies['x-access-token']

    if(!token) return next(new ErrorHandler('Por favor inicie sesión', 401))

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const [rows, _] = await pool.query('SELECT * FROM users WHERE id = ?;', [decoded.id])

    req.user = rows[0]

    delete req.user.password
    delete req.user.reset_pwd_token
    delete req.user.reset_pwd_expire

    next()
})