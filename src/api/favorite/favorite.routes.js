import { Router } from 'express'

import { 
    toggleArticleFavorite,
    getArticlesFromFavorite,
} from './favorite.controller'

import { isAuthenticatedUser } from '../../middleware/auth'

export const favoriteRouter = Router()

favoriteRouter.route('/favorite/toggle').get(isAuthenticatedUser, toggleArticleFavorite)

favoriteRouter.route('/favorites').get(isAuthenticatedUser, getArticlesFromFavorite)