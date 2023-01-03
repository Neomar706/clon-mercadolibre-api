import jwt from "jsonwebtoken"

export const sendToken = function(user, statusCode, res){
    const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
    )

    const options = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 * 60 * 60 * 1000 => 24horas
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