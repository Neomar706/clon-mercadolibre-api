import jwt from "jsonwebtoken"

export const sendToken = function(user, statusCode, res){
    const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE_MIN * 60 * 1000 }
    )

    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
    }

    res.status(statusCode).cookie('x-access-token', token, options).json({
        success: true,
        result: { 
            user,
            token
        },
    })
}