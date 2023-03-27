import { Router } from 'express'

import { 
    getQuestions, 
    makeAnswer,
    makeQuestion,
    getUnansweredQuestions,
    getMyQuestions
} from './question.controller'
import { isAuthenticatedUser } from '../../middleware/auth'


export const questionRouter = Router()

questionRouter.route('/question/new').post(isAuthenticatedUser, makeQuestion)

questionRouter.route('/question/answer').patch(isAuthenticatedUser, makeAnswer)

questionRouter.route('/question/all').get(getQuestions)

questionRouter.route('/question/unanswered').get(getUnansweredQuestions)

questionRouter.route('/question/my-questions').get(isAuthenticatedUser, getMyQuestions)