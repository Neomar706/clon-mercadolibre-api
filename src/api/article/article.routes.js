import { Router } from 'express'

import { createArticle, deleteArticle, getArticles, updateArticle, togglePauseArticle } from './article.controller'
import { isAuthenticatedUser } from '../../middleware/auth'


export const articleRouter = Router()

articleRouter.route('/article/new').post(isAuthenticatedUser, createArticle)

articleRouter.route('/article/delete').delete(isAuthenticatedUser, deleteArticle)

articleRouter.route('/article/update').put(isAuthenticatedUser, updateArticle)

articleRouter.route('/articles').get(getArticles)

articleRouter.route('/article/toggle-pause').patch(isAuthenticatedUser, togglePauseArticle)