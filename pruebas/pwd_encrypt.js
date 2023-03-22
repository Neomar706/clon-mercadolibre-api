const bcrypt = require('bcryptjs')
//$2a$10$2i59MFCpcTFA2xrexeHBeO.Re9S8frG9MCct3hhvNONaJGk6hKbny

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

const decryptPassword = async function(passwd){
    try {
        return await bcrypt.compare(passwd, "$2a$10$t8bJ/W6C/NXJfRmwzzKm1eftP2dd/HC/U8x/SbcOO2Jiww.Q1a.66")
    } catch (err) {
        throw err
    }
    
}

encryptPassword("Oliver123").then(console.log).catch(console.log)
// decryptPassword("AlanPWD").then(console.log).catch(console.log)