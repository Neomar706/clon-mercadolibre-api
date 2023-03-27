import { PrismaClient } from '@prisma/client'

import { catchAsyncErrors } from '../../middleware/catchAsyncErrors'
import { ErrorHandler } from '../../utils/errorHandler'


const prisma = new PrismaClient()

export const toggleArticleFavorite = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const articleId = Number(req.query.articleId) || 0

    if(!articleId)
        return next(new ErrorHandler('Por favor ingrese el campo: articleId', 400))

    const favorite = await prisma.favorite.findFirst({
        where: {
            userId,
            articleId
        }
    })

    if(favorite){
        await prisma.favorite.delete({
            where: { id: favorite.id }
        })
    } else {
        const article = await prisma.article.findFirst({
            where: { id: articleId },
            select: { userId: true }
        })

        if(!article?.userId)
            return next(new ErrorHandler('No se encontró el artículo', 404))

        if(article.userId === userId)
            return next(new ErrorHandler('No puedes guardar en favoritos un artículo publicado por tí', 400))

        await prisma.favorite.create({
            data: {
                link: `/article?id=${articleId}`,
                userId,
                articleId
            }
        })
    }

    res.status(200).json({
        success: true,
        message: favorite
            ? '¡LISTO! eliminamos tu favorito'
            : '¡LISTO! lo añadimos a tus favoritos'
    })
})


export const getArticlesFromFavorite = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const limit = req.query.limit ? Number(req.query.limit) : 10
    const page = req.query.page ? Number(req.query.page) : 1

    const offset = (page - 1) * limit

    const count = await prisma.favorite.count({
        where: { userId }
    })

    if(!count)
        return next(new ErrorHandler('No se encontró ningún artículo', 404))

    const favorites = await prisma.favorite.findMany({
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

    const result = {
        count,
        favorites
    }

    res.status(200).json({
        success: true,
        result
    })
})