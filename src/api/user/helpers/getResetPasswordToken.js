import crypto from 'crypto'
import { pool } from "../../../config/database"


export const getResetPasswordToken = async function(userId){

    const resetToken = crypto.randomBytes(20).toString('hex')

    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    const resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000) // new Date(Date.now() + 15min)

    const [rows, _] = await pool.query(
        'UPDATE users SET reset_pwd_token = ?, reset_pwd_expire = ? WHERE id = ?;',
        [resetPasswordToken, resetPasswordExpire, userId]
    )

    console.log(rows)

    return resetToken
}