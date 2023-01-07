import { Router } from 'express'

import { addArticleToFavotite, getArticlesFromFavorite, removeArticleFromFavorite } from './favorite.controller'
import { isAuthenticatedUser } from '../../middleware/auth'

export const favoriteRouter = Router()

favoriteRouter.route('/favorite/add').get(isAuthenticatedUser, addArticleToFavotite)

favoriteRouter.route('/favorite/remove').delete(isAuthenticatedUser, removeArticleFromFavorite)

favoriteRouter.route('/favorites').get(isAuthenticatedUser, getArticlesFromFavorite)