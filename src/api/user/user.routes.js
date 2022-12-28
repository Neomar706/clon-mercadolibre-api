import { Router } from 'express'
import { 
    signup,
    signin,
    signout,
    forgotPassword,
    resetPassword,
    getUserDetails,
    updateProfile,
    updatePassword
} from './user.controller'
import { isAuthenticatedUser } from '../../middleware/auth'

export const userRouter = Router()

userRouter.route('/signup').post(signup)

userRouter.route('/signin').post(signin)

userRouter.route('/signout').get(signout)

userRouter.route('/password/forgot').post(forgotPassword)

userRouter.route('/password/reset').patch(resetPassword)

userRouter.route('/me').get(isAuthenticatedUser, getUserDetails)

userRouter.route('/me/update').put(isAuthenticatedUser, updateProfile)

userRouter.route('/password/update').patch(isAuthenticatedUser, updatePassword)