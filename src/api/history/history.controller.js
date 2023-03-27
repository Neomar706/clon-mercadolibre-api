import { PrismaClient } from '@prisma/client'
import { catchAsyncErrors } from '../../middleware/catchAsyncErrors'
import { ErrorHandler } from '../../utils/errorHandler'


const prisma = new PrismaClient()

export const add2History = catchAsyncErrors(async (req, res, next) => {
    const articleId = req.query.articleId ? Number(req.query.articleId) : 0
    const userId = req.user.id

    if(!articleId)
        return next(new ErrorHandler('Por favor ingrese el campo: articleId'), 400)

    const count = await prisma.article.count({
        where: { id: articleId }
    })

    if(!count)
        return next(new ErrorHandler('No se encontró el artículo'), 404)

    await prisma.history.create({
        data: {
            link: `/article?id=${articleId}`,
            userId,
            articleId
        }
    })

    res.status(201).json({
        success: true,
        message: '¡LISTO! lo añadimos a tu historial'
    })
})


export const delete2History = catchAsyncErrors(async (req, res, next) => {
    const articleId = req.query.articleId ? Number(req.query.articleId) : 0
    const userId = req.user.id

    if(!articleId)
        return next(new ErrorHandler('Por favor ingrese el campo: articleId'), 400)

    const history = await prisma.history.findFirst({
        where: {
            userId,
            articleId
        }
    })

    if(!history)
        return next(new ErrorHandler('No se encontró el artículo'), 404)

    await prisma.history.delete({
        where: {
            id: history.id
        }
    })

    res.status(200).json({
        success: true,
        message: '¡LISTO! lo eliminamos de tu historial'
    })
})


export const toggleArticleHistory = catchAsyncErrors(async (req, res, next) => {
    const articleId = req.query.articleId ? Number(req.query.articleId) : 0
    const userId = req.user.id

    if(!articleId)
        return next(new ErrorHandler('Por favor ingrese el campo: articleId'), 400)

    const history = await prisma.history.findFirst({
        where: {
            userId,
            articleId
        }
    })

    if(history) {
        await prisma.history.delete({
            where: {
                id: history.id
            }
        })
    } else {
        const count = await prisma.article.count({
            where: { id: articleId }
        })

        if(!count)
            return next(new ErrorHandler('No se encontró el artículo'), 404)

        await prisma.history.create({
            data: {
                link: `/article?id=${articleId}`,
                userId,
                articleId
            }
        })
    }

    res.status(200).json({
        success: true,
        message: history
            ? '¡LISTO! lo eliminamos de tu historial'
            : '¡LISTO! lo añadimos a tu historial'
    })
})


export const getArticlesFromHistory = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const limit = req.query.limit ? Number(req.query.limit) : 10
    const page = req.query.page ? Number(req.query.page) : 1

    const offset = (page - 1) * limit

    const count = await prisma.history.count({
        where: { userId }
    })

    if(!count)
        return next(new ErrorHandler('No se encontró ningún artículo', 404))

    let histories = await prisma.history.findMany({
        where: { userId },
        select: {
            id: true,
            link: true,
            article: {
                select: {
                    id: true,
                    title: true,
                    price: true,
                    stock: true,
                    shipmentFree: true,
                    pictures: {
                        select: {
                            id: true,
                            link: true
                        }
                    }
                }
            }
        },
        take: limit,
        skip: offset,
        orderBy: {
            date: 'desc'
        }
    })

    const favorites = (
        await prisma.favorite.findMany({
            where: { userId },
            select: { articleId: true }
        })
    )
    .map(({ articleId }) => articleId)

    

    histories = histories.map(history => ({
        ...history,
        article: {
            ...history.article,
            isFavorite: favorites.includes(history.article.id) ? true : false 
        }
    }))

    const result = {
        count,
        histories
    }

    res.status(200).json({
        success: true,
        result
    })
})