import { Router } from 'express'

import { getCategories, getCategory, createCategory, deleteCategory, updateCategory } from './category.controller'

export const categoryRouter = Router()

categoryRouter.route('/category/all').get(getCategories)

categoryRouter.route('/category/one').get(getCategory)

categoryRouter.route('/category/create').post(createCategory)

categoryRouter.route('/category/delete').delete(deleteCategory)

categoryRouter.route('/category/update').patch(updateCategory)