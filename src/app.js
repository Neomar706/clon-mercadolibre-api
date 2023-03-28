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
import { articleRouter } from './api/article/article.routes'
import { favoriteRouter } from './api/favorite/favorite.routes'
import { addressRouter } from './api/address/address.routes'
import { questionRouter } from './api/question/question.routes'
import { historyRouter } from './api/history/history.routes'


// dotenv.config({ path: path.join(__dirname, 'config', '.env') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })
export const app = express()

/** Global variables */
app.set('port', process.env.PORT || 5000)


/** Middlewares */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '60mb' }))
app.use(cookieParser(process.env.SECRET_SESSION_KEY))
process.env.NODE_ENV === 'development' && app.use(morgan('dev'))
app.use(cors({
    // origin: process.env.FRONTEND_HOST,
    origin: '*',
    credentials: true
}))
app.use(sessionMiddleware())


/** Middlewares Routes */
app.use('/api/v1', userRouter)
app.use('/api/v1', categoryRouter)
app.use('/api/v1', articleRouter)
app.use('/api/v1', favoriteRouter)
app.use('/api/v1', addressRouter)
app.use('/api/v1', questionRouter)
app.use('/api/v1', historyRouter)


app.use(errorMiddleware)