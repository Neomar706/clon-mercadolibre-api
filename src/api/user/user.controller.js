import crypto from 'crypto'

import { catchAsyncErrors } from '../../middleware/catchAsyncErrors'
import { ErrorHandler } from '../../utils/errorHandler'
import { pool } from '../../config/database'
import { verifyRequiredFields } from '../../utils/verifyRequiredFields'
import { encryptPassword } from './helpers/encryptPassword'
import { matchPassword } from './helpers/matchPassword'
import { sendToken } from './helpers/sendToken'
import { getResetPasswordToken } from './helpers/getResetPasswordToken'
import { sendEmail } from './helpers/sendEmail'

export const signup = catchAsyncErrors(async(req, res, next) => {
    const requiredFields = ['name', 'lastname', 'username', 'dni', 'email', 'password', 'phone']
    const [isOk, field] = verifyRequiredFields(req.body, requiredFields)
    
    if(!isOk) return next(new ErrorHandler(`Por favor ingrese el campo: ${field}`, 400))

    const objCopy = { ...req.body }

    delete objCopy.password
    objCopy.password = await encryptPassword(req.body.password)

    const query = 'SELECT * FROM users WHERE username = ? OR email = ?;'
    const [rows, _] = await pool.query(query, [objCopy.username, objCopy.email])

    if(rows[0]) return next(new ErrorHandler('El usuario ya se encuentra registrado', 401))

    const _query = 'INSERT INTO users (name, lastname, username, dni, email, password, phone) VALUES (?, ?, ?, ?, ?, ?, ?);'
    await pool.query(
        _query,
        [objCopy.name, objCopy.lastname, objCopy.username, objCopy.dni, objCopy.email, objCopy.password, objCopy.phone]
    )

    res.status(200).json({
        success: true,
        message: 'Usuario registrado con exito'
    })

})


export const signin = catchAsyncErrors(async (req, res, next) => {
    const { username, password } = req.body

    const [isOk, field] = verifyRequiredFields(req.body, ['username', 'password'])

    if(!isOk) return next(new ErrorHandler(`Por favor ingrese el campo: ${field}`, 400))

    const query = 'SELECT * FROM users WHERE username = ? OR email = ?;'
    const [rows, _] = await pool.query(query, [username, username])

    const user = rows[0]

    if(!user) return next(new ErrorHandler('Usuario o contrase??a inv??lida', 401))

    const isMatch = await matchPassword(password, user.password)
    if(!isMatch) return next(new ErrorHandler('Usuario o contrase??a inv??lida', 401))
    
    delete user.password
    delete user.reset_pwd_token
    delete user.reset_pwd_expire

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
        message: 'Sesi??n finalizada',
    })
})


export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body

    if(!email) return next(new ErrorHandler('Por favor ingrese el campo: email', 400))

    const query = 'SELECT * FROM users WHERE email = ?;'
    const [rows, _] = await pool.query(query, [email])

    if(!rows[0]) return next(new ErrorHandler('Correo inv??lido', 400))

    const user = rows[0]
    const resetToken = await getResetPasswordToken(user.id)

    const resetPasswordURL = `${process.env.FRONTEND_HOST}/password/reset?token=${resetToken}`
    const message = `Su enlace de recuperaci??n es: ${resetPasswordURL}\n\nSi no pidi?? este correo por favor ign??relo.`
    
    try {
        sendEmail({
            email: user.email,
            subject: 'MercadoLibre Clone APP',
            message
        })

        res.status(200).json({
            success: true,
            message: `Se envi?? un enlace de recuperaci??n al correo: ${user.email}`
        })
    } catch (err) {
        const query = 'UPDATE users SET reset_pwd_token = ?, reset_pwd_expire = ?'
        await pool.query(query, [null, null])
        
        return next(new ErrorHandler(err.message, 500))
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

    const query = 'SELECT * FROM users WHERE reset_pwd_token = ? AND reset_pwd_expire > CURRENT_TIMESTAMP;'
    const [rows, _] = await pool.query(query, [resetPasswordToken])

    if(!rows[0]) return next(new ErrorHandler('Este enlace de recuperaci??n es inv??lido o ha expirado', 400))
    const user = rows[0]

    if(password !== confirm_password) return next(new ErrorHandler('Las contrase??as no coinciden', 400))

    const isMatch = await matchPassword(password, user.password)
    if(isMatch) return next(new ErrorHandler('La nueva contrase??a nueva debe ser diferente a la anterior', 400))
    
    const encryptedPassword = await encryptPassword(password)

    const _query = 'UPDATE users SET password = ?, reset_pwd_token = ?, reset_pwd_expire = ? WHERE id = ?;'
    const [_rows, __] = await pool.query(_query, [encryptedPassword, null, null, user.id])

    delete user.password
    delete user.reset_pwd_token
    delete user.reset_pwd_expire

    sendToken(user, 200, res)
})


export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
   sendToken(req.user, 200, res)
})


export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const objParams = {
        name: req.body.name,
        lastname: req.body.lastname,
        username: req.body.username,
        dni: req.body.dni,
        email: req.body.email,
        phone: req.body.phone
    }

    for(let key in objParams)
        if(objParams[key] === undefined || objParams[key] === '') delete objParams[key]

    let query = 'UPDATE users SET '
    Object.keys(objParams).forEach(elem => query += `${elem} = ?, `)
    query = query.slice(0, query.length - 2)
    query += ' WHERE id = ?;'

    await pool.query(query, [...Object.values(objParams), req.user.id])

    res.status(200).json({
        success: true,
        message: 'Datos actualizados con exito'
    })
})


export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const requiredFields = ['old_password', 'new_password', 'confirm_password']
    const [isOk, field] = verifyRequiredFields(req.body, requiredFields)
    console.log("req.user:", req.user)
    if(!isOk) return next(new ErrorHandler(`Por favor ingrese el campo: ${field}`))

    const { old_password, new_password, confirm_password } = req.body

    const query = 'SELECT password FROM users WHERE id = ?;'
    const [rows, _] = await pool.query(query, [req.user.id])
    const encryptedPasswordFromDB = rows[0].password

    const isMatch = await matchPassword(old_password, encryptedPasswordFromDB)
    if(!isMatch) return next(new ErrorHandler('La contrase??a anterior es incorrecta', 400))

    const _isMatch = await matchPassword(new_password, encryptedPasswordFromDB)
    if(_isMatch) return next(new ErrorHandler('La nueva contrase??a nueva debe ser diferente a la anterior', 400))

    if(new_password !== confirm_password) return next(new ErrorHandler('Las contrase??as no coinciden', 400))

    const encryptedPasswordFromReq = await encryptPassword(new_password)

    const _query = 'UPDATE users SET password = ? WHERE id = ?;'
    const [_rows, __] = await pool.query(_query, [encryptedPasswordFromReq, req.user.id])

    res.status(200).json({
        success: true,
        message: 'La contrase??a se actualiz?? exitosamente'
    })
})