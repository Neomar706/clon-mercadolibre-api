import { Router } from 'express'

import { 
    add2History, 
    delete2History, 
    getArticlesFromHistory, 
    toggleArticleHistory 
} from './history.controller'
import { isAuthenticatedUser } from '../../middleware/auth'

export const historyRouter = Router()


historyRouter.route('/history/add').get(isAuthenticatedUser, add2History)

historyRouter.route('/history/delete').get(isAuthenticatedUser, delete2History)

historyRouter.route('/history/toggle').get(isAuthenticatedUser, toggleArticleHistory)

historyRouter.route('/history/all').get(isAuthenticatedUser, getArticlesFromHistory)