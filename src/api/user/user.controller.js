import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'

import { catchAsyncErrors } from '../../middleware/catchAsyncErrors'
import { ErrorHandler } from '../../utils/errorHandler'
import { verifyRequiredFields } from '../../utils/verifyRequiredFields'
import { encryptPassword } from './helpers/encryptPassword'
import { matchPassword } from './helpers/matchPassword'
import { sendToken } from './helpers/sendToken'
import { getResetPasswordToken } from './helpers/getResetPasswordToken'
import { sendEmail } from './helpers/sendEmail'

const prisma = new PrismaClient()

export const signup = catchAsyncErrors(async(req, res, next) => {
    const requiredFields = ['name', 'lastname', 'username', 'dni', 'email', 'password', 'phone']
    const [isOk, field] = verifyRequiredFields(req.body, requiredFields)
    
    if(!isOk) return next(new ErrorHandler(`Por favor ingrese el campo: ${field}`, 400))

    const objCopy = { ...req.body }

    delete objCopy.password
    objCopy.password = await encryptPassword(req.body.password)

    const user = await prisma.user.findFirst({
        where: {
            OR: [{
                username: {
                    equals: objCopy.username
                }
            }, {
                email: {
                    equals: objCopy.email
                }
            }]
        }
    })

    if(user) return next(new ErrorHandler('El usuario ya se encuentra registrado', 401))
    
    await prisma.user.create({
        data: {
            name: objCopy.name,
            lastname: objCopy.lastname,
            username: objCopy.username,
            dni: objCopy.dni,
            email: objCopy.email,
            password: objCopy.password,
            phone: objCopy.phone
        }
    })

    res.status(200).json({
        success: true,
        message: 'Usuario registrado con exito'
    })
})


export const signin = catchAsyncErrors(async (req, res, next) => {
    const { username, password } = req.body

    const [isOk, field] = verifyRequiredFields(req.body, ['username', 'password'])

    if(!isOk) return next(new ErrorHandler(`Por favor ingrese el campo: ${field}`, 400))

    const user = await prisma.user.findFirst({
        where: {
            OR: [{
                username: {
                    equals: username
                }
            }, {
                email: {
                    equals: username
                }
            }]
        },
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

    if(!user) 
        return next(new ErrorHandler('Usuario o contraseña inválida', 401))

    const isMatch = await matchPassword(password, user.password)

    if(!isMatch) 
        return next(new ErrorHandler('Usuario o contraseña inválida', 401))

    delete user.password
    delete user.resetPwdToken
    delete user.resetPwdExpire

    sendToken(user, 200, res)
})


export const signout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('x-access-token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })
    delete req.user
    res.status(200).json({
        success: true,
        message: 'Sesión finalizada',
    })
})


export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body

    if(!email) return next(new ErrorHandler('Por favor ingrese el campo: email', 400))

    const user = await prisma.user.findUnique({
        where: { email }
    })


    if(!user) 
        return next(new ErrorHandler('Correo inválido', 400))

    const resetToken = await getResetPasswordToken(user.id)

    const resetPasswordURL = `${process.env.FRONTEND_HOST}/password/reset?token=${resetToken}`
    const message = `Su enlace de recuperación es: ${resetPasswordURL}\n\nSi no pidió este correo por favor ignórelo.`
    
    try {
        sendEmail({
            email: user.email,
            subject: 'MercadoLibre Clone APP',
            message
        })

        res.status(200).json({
            success: true,
            message: `Se envió un enlace de recuperación al correo: ${user.email}`
        })
    } catch (err) {

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPwdToken: null,
                resetPwdExpire: null
            }
        })

        // return next(new ErrorHandler(err.message, 500))
        next(new ErrorHandler(err.message, 500))
    }
})


export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const requiredFields = ['password', 'confirm_password', 'token']
    const [isOk, field] = verifyRequiredFields(req.body, requiredFields)

    if(!isOk) return next(new ErrorHandler(`Por favor ingrese en campo: ${field}`, 400))

    const { password, confirm_password, token } = req.body

    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex')


    const user = await prisma.user.findFirst({
        where: {
            resetPwdToken: resetPasswordToken,
            resetPwdExpire: { gt: new Date() }
        }
    })

    if(password !== confirm_password) return next(new ErrorHandler('Las contraseñas no coinciden', 400))

    const isMatch = await matchPassword(password, user.password)

    if(isMatch) 
        return next(new ErrorHandler('La nueva contraseña nueva debe ser diferente a la anterior', 400))
    
    const encryptedPassword = await encryptPassword(password)

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: encryptedPassword,
            resetPwdToken: null,
            resetPwdExpire: null
        }
    })

    delete user.password
    delete user.resetPwdToken
    delete user.resetPwdExpire

    sendToken(user, 200, res)
})


export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
   sendToken(req.user, 200, res)
})


export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const obj = {
        name: req.body.name,
        lastname: req.body.lastname,
        username: req.body.username,
        dni: req.body.dni,
        email: req.body.email,
        phone: req.body.phone
    }

    for(let key in obj)
        if(obj[key] === undefined || obj[key] === '') 
            delete obj[key]

    
    await prisma.user.update({
        where: { id: req.user.id },
        data: obj
    })

    res.status(200).json({
        success: true,
        message: 'Datos actualizados con exito'
    })
})


export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const requiredFields = ['old_password', 'new_password', 'confirm_password']
    const [isOk, field] = verifyRequiredFields(req.body, requiredFields)
    
    if(!isOk) return next(new ErrorHandler(`Por favor ingrese el campo: ${field}`))

    const { old_password, new_password, confirm_password } = req.body


    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { password: true }
    })

    const encryptedPasswordFromDB = user.password

    const isMatch = await matchPassword(old_password, encryptedPasswordFromDB)
    if(!isMatch) 
        return next(new ErrorHandler('La contraseña anterior es incorrecta', 400))

    const _isMatch = await matchPassword(new_password, encryptedPasswordFromDB)
    if(_isMatch) 
        return next(new ErrorHandler('La nueva contraseña nueva debe ser diferente a la anterior', 400))

    if(new_password !== confirm_password) 
        return next(new ErrorHandler('Las contraseñas no coinciden', 400))

    const encryptedPasswordFromReq = await encryptPassword(new_password)


    await prisma.user.update({
        where: { id: req.user.id },
        data: { password: encryptedPasswordFromReq }
    })

    res.status(200).json({
        success: true,
        message: 'La contraseña se actualizó exitosamente'
    })
})