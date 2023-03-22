const dotenv = require( 'dotenv')
const path = require( 'path')
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

const pool = _pool.promise()

const main = async function(){
    const [rows, _] = await pool.query("SELECT description FROM `articles` WHERE id = 9")
    console.log(rows)
    // console.log(
    //     (await pool.query("SELECT description FROM `articles` WHERE id = 9"))[0][0]
    // )
}

main()
    .then(async () => {
    })
    .catch(async e => {
    })