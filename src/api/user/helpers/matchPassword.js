import bcrypt from 'bcryptjs'

export const matchPassword = async function(plainPWD, encryptedPWD){
    return await bcrypt.compare(plainPWD, encryptedPWD)
}
