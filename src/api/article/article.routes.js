import { Router } from 'express'

import {
    createArticle,
    deleteArticle,
    getArticles,
    updateArticle,
    togglePauseArticle,
    searchArticleFilter,
    articleDetails,
    getArticlesByUserId
} from './article.controller'
import { isAuthenticatedUser } from '../../middleware/auth'


export const articleRouter = Router()

articleRouter.route('/article/new').post(isAuthenticatedUser, createArticle)

articleRouter.route('/article/delete').delete(isAuthenticatedUser, deleteArticle)

articleRouter.route('/article/update').put(isAuthenticatedUser, updateArticle)

articleRouter.route('/articles').get(getArticles)

articleRouter.route('/articles/by-user').get(getArticlesByUserId)

articleRouter.route('/article/toggle-pause').patch(isAuthenticatedUser, togglePauseArticle)

articleRouter.route('/article/search').get(searchArticleFilter)

articleRouter.route('/article/details').get(articleDetails)