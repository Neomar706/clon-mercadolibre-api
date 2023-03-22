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

userRouter.route('/auth/signup').post(signup)

userRouter.route('/auth/signin').post(signin)

userRouter.route('/auth/signout').get(signout)

userRouter.route('/auth/password/forgot').post(forgotPassword)

userRouter.route('/auth/password/reset').patch(resetPassword)

userRouter.route('/user/me').get(isAuthenticatedUser, getUserDetails)

userRouter.route('/user/me/update').put(isAuthenticatedUser, updateProfile)

userRouter.route('/user/password/update').patch(isAuthenticatedUser, updatePassword)