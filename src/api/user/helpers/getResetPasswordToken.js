import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

export const getResetPasswordToken = async function(userId){

    const resetToken = crypto.randomBytes(20).toString('hex')

    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    const resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000) // new Date(Date.now() + 15min)

    await prisma.user.update({
        where: { id: userId },
        data: {
            resetPwdToken: resetPasswordToken,
            resetPwdExpire: resetPasswordExpire
        }
    })

    return resetToken
}