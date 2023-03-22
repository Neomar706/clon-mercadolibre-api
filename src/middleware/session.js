import session from 'express-session'
import mysqlSession from 'express-mysql-session'

export const sessionMiddleware = function(){

    const MySQLStore = mysqlSession(session)

    const options = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PWD,
        database: process.env.DB_NAME,
        clearExpired: process.env.CLEAR_SESSION_EXPIRE,
        expiration: process.env.EXPIRE_SESSION_TIME
    }

    const sessionStore = new MySQLStore(options)

    return session({
        secret: process.env.SECRET_SESSION_KEY,
        resave: true,
        saveUninitialized: true,
        store: sessionStore
    })

}