import dotenv from 'dotenv'
import path from 'path'
const mysql = require('mysql2')

dotenv.config({ path: path.join(__dirname, '.env') })
const { DB_HOST, DB_PORT, DB_USER, DB_PWD, DB_NAME, DB_CONNECTION_LIMIT } = process.env

const _pool = mysql.createPool({
    connectionLimit: DB_CONNECTION_LIMIT,
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PWD,
    database: DB_NAME
})

export const pool = _pool.promise()