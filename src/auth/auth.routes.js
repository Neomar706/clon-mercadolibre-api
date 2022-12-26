import { Router } from 'express'
import { register } from './auth.controller'


export const authRouter = Router()

authRouter.route('/register').post(register)