import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

import { catchAsyncErrors } from './catchAsyncErrors'
import { ErrorHandler } from '../utils/errorHandler'

const prisma = new PrismaClient()

export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const token = req.cookies['x-access-token']

    if(!token)
        return next(new ErrorHandler('Por favor inicie sesión', 401))

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
            addresses: {
                where: {
                    currentAddress: true
                },
                select: {
                    id: true,
                    state: true,
                    city: true,
                    parish: true,
                    street: true
                }
            }
        }
    })
    
    req.user = user

    delete req.user.password
    delete req.user.resetPwdToken
    delete req.user.resetPwdExpire


    next()
})