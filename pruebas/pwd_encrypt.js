const bcrypt = require('bcryptjs')

const encryptPassword = async function(passwd){
    const SALT_ROUNDS = 10

    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS)
        const hash = await bcrypt.hash(passwd, salt)
        return hash
    } catch (err) {
        throw err
    }
}

encryptPassword('').then(console.log).catch(console.log)