import bcrypt from 'bcryptjs'

export const encryptPassword = async function(passwd){
    const SALT_ROUNDS = 10

    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS)
        const hash = await bcrypt.hash(passwd, salt)
        return hash
    } catch (err) {
        throw err
    }
}