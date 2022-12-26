// import dotenv from 'dotenv'
// import path from 'path'
import { app } from './app'


// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`)
    console.log(`Shutting down the server due to Uncaught Exception`)
    process.exit(1)
})

// dotenv.config({ path: path.join(__dirname, '.env') })

const server = app.listen(app.get('port'), () => console.log(`Server listening on port: ${app.get('port')}`))


// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`)
    console.log(`Shutting down the server due to Unhandled Promise Rejection`)

    server.close(() => {
        process.exit(1)
    })
})