import { Router } from 'express'

import { deleteAddress, getAddresses, newAddress, updateAddress } from './address.controller'
import { isAuthenticatedUser } from '../../middleware/auth'

export const addressRouter = Router()

addressRouter.route('/address/new').post(isAuthenticatedUser, newAddress)

addressRouter.route('/addresses').get(isAuthenticatedUser, getAddresses)

addressRouter.route('/address/update').put(isAuthenticatedUser, updateAddress)

addressRouter.route('/address/delete').delete(isAuthenticatedUser, deleteAddress)