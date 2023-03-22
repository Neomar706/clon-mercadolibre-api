import { PrismaClient } from '@prisma/client'

import { catchAsyncErrors } from '../../middleware/catchAsyncErrors'
import { ErrorHandler } from '../../utils/errorHandler'
import { verifyRequiredFields } from '../../utils/verifyRequiredFields'


const prisma = new PrismaClient()

export const newAddress = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const requiredFields = ['state', 'city', 'municipality', 'parish', 'street', 'current_address']
    const [isOk, field] = verifyRequiredFields(req.body, requiredFields)

    if(!isOk)
        return next(new ErrorHandler(`Por favor ingrese el campo: ${field}`, 400))

    const { state, city, municipality, parish, street, current_address } = req.body
    const house_number = req.body?.house_number

    if(current_address)
        await prisma.address.updateMany({
            where: { userId },
            data: { currentAddress: false }
        })
    
    
    const addressCreated = await prisma.address.create({
        data: {
            userId,
            state,
            city,
            municipality,
            parish,
            street,
            currentAddress: current_address,
            houseNumber: house_number ?? null
        }
    })

    if(!addressCreated) 
        return next(new ErrorHandler('No se pudo guardar la dirección', 500))

    res.status(200).json({
        success: true,
        message: '¡Listo! guardamos tu derección'
    })
})


export const getAddresses = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id

    const addresses = await prisma.address.findMany({
        where: { userId }
    })

    if(!addresses) 
        return next(new ErrorHandler('Aún no has registrado ningún domicilio', 400))

    const results = addresses.map(address => ({
        id:              address.id,
        state:           address.state,
        city:            address.city,
        municipality:    address.municipality,
        parish:          address.parish,
        street:          address.street,
        house_number:    address.houseNumber,
        current_address: address.currentAddress
    }))

    res.status(200).json({
        success: true,
        results
    })
})


export const updateAddress = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const addressId = Number(req.query.id)

    if(!addressId) return next(new ErrorHandler('Por favor ingrese el campo: id'))

    const obj = {}
    req.body.state           ? obj['state'] = req.body.state                     : null
    req.body.city            ? obj['city'] = req.body.city                       : null
    req.body.municipality    ? obj['municipality'] = req.body.municipality       : null
    req.body.parish          ? obj['parish'] = req.body.parish                   : null
    req.body.street          ? obj['street'] = req.body.street                   : null
    req.body.house_number    ? obj['houseNumber'] = req.body.house_number        : null
    req.body.current_address ? obj['currentAddress'] = req.body.current_address  : null


    const updated = await prisma.address.updateMany({
        where: {
            AND: [
                { id: addressId },
                { userId }
            ]
        },
        data: obj,
    })

    if(!updated.count) 
        return next(new ErrorHandler('No se pudo actualizar el domicilio', 400))

    res.status(200).json({
        success: true,
        message: '¡Listo! actulizamos tu domicilio'
    })
})


export const deleteAddress = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const addressId = Number(req.query.id)

    const deleted = await prisma.address.deleteMany({
        where: {
            AND: [
                { id: addressId },
                { userId },
                { currentAddress: false }
            ]
        }
    })

    if(!deleted.count)
        return next(new ErrorHandler('No se pudo eliminar el domicilio', 400))

    res.status(200).json({
        success: true,
        message: '¡Listo! eliminamos el domicilio'
    })
})