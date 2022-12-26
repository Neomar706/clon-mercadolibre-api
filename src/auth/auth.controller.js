import { catchAsyncErrors } from '../middleware/catchAsyncErrors'
import { ErrorHandler } from '../utils/errorHandler'

import bcrypt from 'bcryptjs'


export const register = catchAsyncErrors(async(req, res, next) => {
    const { name, lastname, identifier, email, password } = req.body

    if(req.body.identifier < 0) {
        next(new ErrorHandler('New Error Handler', 400))
    } else {

        const obj = {
            name,
            lastname,
            identifier,
            email,
            password
        }
    
        await new Promise(r => setTimeout(r, 3000))
    
        const _password = await encryptPassword(password)
    
        delete obj.password
        obj.password = _password
    
        res.status(200).json({
            success: true,
            ...obj,
        })
    
        console.log(req.body);
        res.send()
    }
})

const encryptPassword = async function(passwd){
    const SALT_ROUNTS = 10
    bcrypt.getSalt(SALT_ROUNTS, (err, salt) => {
        if(err) return console.log('ERROR SALT: ', err)
        bcrypt.hash(passwd, salt, (err, hash) => {
            if(err) return console.log('ERROR HASH: ', err)
            return hash
        })
    })
}