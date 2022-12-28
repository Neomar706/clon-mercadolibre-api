import dotenv from 'dotenv'
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { errorMiddleware } from './middleware/error'
import { sessionMiddleware } from './middleware/session'

/** Routes imports */
import { userRouter } from './api/user/user.routes'


dotenv.config({ path: path.join(__dirname, 'config', '.env') })
export const app = express()

/** Global variables */
app.set('port', process.env.PORT || 5000)


/** Middlewares */
app.use(bodyParser.urlencoded({  extended: true }))
app.use(bodyParser.json())
app.use(cookieParser(process.env.SECRET_SESSION_KEY))
process.env.NODE_ENV === 'development' && app.use(morgan('dev'))
app.use(sessionMiddleware())

/** Middlewares Routes */
app.use('/api/v1', userRouter)


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