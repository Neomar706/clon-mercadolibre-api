import dotenv from 'dotenv'
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import { errorMiddleware } from './middleware/error'

/** Routes imports */
import { authRouter } from './auth/auth.routes'


dotenv.config({ path: path.join(__dirname, '..', '.env') })
export const app = express()

/** Global variables */
app.set('port', process.env.PORT || 5000)


/** Middlewares */
app.use(bodyParser.urlencoded({  extended: true }))
app.use(bodyParser.json())

/** Middlewares Routes */
app.use('/api/v1', authRouter)


app.use(errorMiddleware)




















































































// import express from 'express'
// import bodyParser from 'body-parser'
// import { userRouter } from './auth/auth.routes'
// import { errorMiddleware } from './middleware/error'

// export const app = express()

// app.set('port', process.env.PORT || 5000)

// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json())

// app.use('/api/v1', userRouter)

// app.use(errorMiddleware)