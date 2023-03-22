import { PrismaClient } from '@prisma/client'

import { catchAsyncErrors } from '../../middleware/catchAsyncErrors'
import { ErrorHandler } from '../../utils/errorHandler'

const prisma = new PrismaClient()

export const getCategories = catchAsyncErrors(async (req, res, next) => {
    const categories = await prisma.category.findMany()

    res.status(200).json({
        success: true,
        results: categories
    })
})


export const getCategory = catchAsyncErrors(async (req, res, next) => {
    const id = Number(req.query.id)

    if(!id) 
        return next(new ErrorHandler('Por favor ingrese el campo: id', 400))

    const category = await prisma.category.findUnique({
        where: { id }
    })

    if(!category)
        return next(new ErrorHandler('No se encontro ninguna categoría', 404))

    res.status(200).json({
        success: true,
        result: category
    })
})


export const createCategory = catchAsyncErrors(async (req, res, next) => {
    const { category_name } = req.body

    if(!category_name) 
        return next(new ErrorHandler('Por favor ingrese el campo: category_name', 400))

    await prisma.category.create({
        data: {
            category: category_name
        }
    })

    res.status(200).json({
        success: true,
        message: 'Categoría creada con exito'
    })
})


export const deleteCategory = catchAsyncErrors(async (req, res, next) => {
    const id = Number(req.query.id)

    if(!id)
        return next(new ErrorHandler('Por favor ingrese el campo: id', 400))

    await prisma.category.delete({
        where: { id }
    })

    res.status(200).json({
        success: true,
        message: 'Categoría eliminada con exito'
    })
})


export const updateCategory = catchAsyncErrors(async (req, res, next) => {
    const id = Number(req.query.id)
    const { category_name } = req.body

    if(!id)
        return next(new ErrorHandler('Por favor ingrese el campo: id'))

    if(!category_name)
        return next(new ErrorHandler('Por favor ingrese el campo: category_name'))

    
    await prisma.category.update({
        where: { id },
        data: { category: category_name }
    })

    res.status(200).json({
        success: true,
        message: 'Categoría actualizada con exito'
    })
})
