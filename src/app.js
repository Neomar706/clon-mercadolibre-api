import dotenv from 'dotenv'
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import cors from 'cors'
import { errorMiddleware } from './middleware/error'
import { sessionMiddleware } from './middleware/session'

/** Routes imports */
import { userRouter } from './api/user/user.routes'
import { categoryRouter } from './api/category/category.routes'


dotenv.config({ path: path.join(__dirname, 'config', '.env') })
export const app = express()

/** Global variables */
app.set('port', process.env.PORT || 5000)


/** Middlewares */
app.use(bodyParser.urlencoded({  extended: true }))
app.use(bodyParser.json())
app.use(cookieParser(process.env.SECRET_SESSION_KEY))
process.env.NODE_ENV === 'development' && app.use(morgan('dev'))
app.use(cors({ 
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(sessionMiddleware())


/** Middlewares Routes */
app.use('/api/v1', userRouter)
app.use('/api/v1', categoryRouter)


app.use(errorMiddleware)