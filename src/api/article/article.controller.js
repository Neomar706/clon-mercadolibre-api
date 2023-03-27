import { v2 as cloudinary } from 'cloudinary'
import { PrismaClient } from '@prisma/client'

import { catchAsyncErrors } from '../../middleware/catchAsyncErrors'
import { ErrorHandler } from '../../utils/errorHandler'
import { verifyRequiredFields } from '../../utils/verifyRequiredFields'
import { ArticleFeatures } from './helpers/articleFeatures'
import { deleteFromDBAndCloudinary } from './helpers/deleteFromDBAndCloudinary'
import { withoutPicturesOfDatabase } from './helpers/withoutPicturesOfDatabase'
import { randomCategory } from './helpers/randomCategory'
import { getPriceBs } from './helpers/getPriceBs'


const prisma = new PrismaClient()

export const createArticle = catchAsyncErrors(async (req, res, next) => {
    const requiredFields = ['title', 'brand', 'model', 'isNew', 'stock', 'price', 'shipmentFree', 'daysWarranty', 'description', 'images', 'categories']
    const [isOk, field] = verifyRequiredFields(req.body, requiredFields)

    if(!isOk) return next(new ErrorHandler(`Por favor ingrese el campo: ${field}`))


    const { id: userId } = req.user
    const { title, brand, model, isNew, stock, price, shipmentFree, daysWarranty, description } = req.body
    const { images, categories } = req.body

    const imagesLinks = []

    for(let i = 0; i < images.length; i++){
        const result = await cloudinary.uploader.upload(images[i], {
            folder: 'articles',
            transformation: [{
                width: 1000
            }]
        })

        imagesLinks.push({
            publicId: result.public_id,
            link: result.secure_url
        })
    }

    await prisma.article.create({
        data: {
            userId,
            title,
            brand,
            model,
            isNew,
            isPaused: false,
            stock,
            price,
            shipmentFree,
            daysWarranty,
            description,
            pictures: { create: imagesLinks },
            categories: { connect: categories.map(id => ({ id })) }
        }
    })
    
    res.status(200).json({
        success: true,
        message: 'Artículo publicado con éxito'
    })
})


export const deleteArticle = catchAsyncErrors(async (req, res, next) => {
    const articleId = Number(req.query.id)
    const userId = Number(req.user.id)

    if(!articleId) return next(new ErrorHandler('Por favor ingrese el campo: id', 400))

    const finded = await prisma.article.count({
        where: {
            id: articleId,
            userId
        }
    })

    if(!finded) return next(new ErrorHandler('No se encontró ningún artículo', 404))

    const pictures = await prisma.picture.findMany({
        where: { articleId },
        select: { publicId: true }
    })


    try {
        await prisma.article.delete({
            where: { id: articleId }
        })

        await Promise.all(pictures.map(({ publicId }) => cloudinary.uploader.destroy(publicId)))
    } catch (err) {
        next(err)
    }
    
    res.status(200).json({
        success: true,
        message: 'Artículo se eliminado con éxito'
    })
})


export const updateArticle = catchAsyncErrors(async (req, res, next) => {
    const userId = Number(req.user.id)
    const articleId = Number(req.query.id)

    if(!articleId)
        return next(new ErrorHandler('Por favor ingrese el campo: id'))

    const finded = await prisma.article.count({
        where: {
            id: articleId,
            userId: userId
        }
    })

    if(!finded)
        return next(new ErrorHandler('No se encontró ningún artículo', 404))
    
    const obj = {}
    req.body.title          ? obj['title'] = req.body.title                 : null
    req.body.brand          ? obj['brand'] = req.body.brand                 : null
    req.body.model          ? obj['model'] = req.body.model                 : null
    req.body.is_new         ? obj['isNew'] = req.body.is_new                : null
    req.body.is_paused      ? obj['isPaused'] = req.body.is_paused          : null
    req.body.stock          ? obj['stock'] = req.body.stock                 : null
    req.body.price          ? obj['price'] = req.body.price                 : null
    req.body.shipment_free  ? obj['shipmentFree'] = req.body.shipment_free  : null
    req.body.days_warranty  ? obj['daysWarranty'] = req.body.days_warranty  : null
    req.body.description    ? obj['description'] = req.body.description     : null
    req.body.pictures       ? obj['pictures'] = req.body.pictures           : null
    req.body.categories     ? obj['categories'] = req.body.categories       : null


    const imagesLinks = []

    if(obj.pictures){
        const pictures = await prisma.picture.findMany({
            where: {
                articleId
            },
            select: {
                link: true
            }
        })

        let pictures4Delete = pictures.filter(({ link }) => !obj.pictures.includes(link))
        pictures4Delete = pictures4Delete.map(({ link }) => link)
        
        deleteFromDBAndCloudinary(prisma.picture, pictures4Delete, next)        

        
        const filteredPictures = withoutPicturesOfDatabase(obj.pictures)

        for(let i = 0; i < filteredPictures.length; i++){
            try {
                const result = await cloudinary.uploader.upload(filteredPictures[i], {
                    folder: 'articles',
                    transformation: [{
                        width: 1000
                    }]
                })
                imagesLinks.push({
                    publicId: result.public_id,
                    link: result.secure_url
                })
            } catch (err) {
                next(err)
            }
        }
    }

    const pictures = await prisma.picture.findMany({
        where: { articleId },
        select: { publicId: true }
    })

    try {
        const data = obj

        if(imagesLinks.length)
            data.pictures = {
                create: imagesLinks
            }


        if(obj.categories?.length){

            const categories = await prisma.category.findMany({
                where: {
                    articles: {
                        some: {
                            id: articleId,
                        }
                    }
                },
                select: {
                    id: true
                }
            })

            data.categories = {
                disconnect: categories,
                connect: obj.categories.map(id => ({ id }))
            }
        }

        await prisma.article.update({
            where: {
                id: articleId,
            },
            data
        })

        await Promise.all(pictures.map(({ publicId }) => cloudinary.uploader.destroy(publicId)))
    } catch (err) {
        await Promise.all(imagesLinks.map(({ publicId }) => cloudinary.uploader.destroy(publicId)))
    }

    res.status(200).json({
        success: true,
        message: 'Artículo actualizado con éxito'
    })
})


const getArticlesRecursive = async function(req, res, next){
    let distinct_of
    if(!req.query.distinct_of) distinct_of = ['']
    else distinct_of = JSON.parse(decodeURIComponent(req.query.distinct_of))

    const distinctCategories = (
        await prisma.category.findMany({
            where: {     
                articles: {
                    some: {} // Don't remove
                }
            },
            select: {
                category: true
            }
        })
    )
    .map(({ category }) => category)

    const hasError = distinctCategories.every(elem => distinct_of.includes(elem))
    if(hasError) return () => next(new ErrorHandler('No se encontró ningún artículo', 404))

    const category = await randomCategory(prisma.category, distinct_of)

    let articles = await prisma.article.findMany({
        where: {
            categories: {
                some: {
                    category
                }
            },
            isPaused: false
        },
        select: {
            id: true,
            title: true,
            price: true,
            shipmentFree: true,
            pictures: {
                select: {
                    id: true,
                    link: true,
                }
            }
        }
    })

    if(!articles.length) return await getArticlesRecursive(req, res, next)

    if(req.query.userId){
        const favorites = (
            await prisma.favorite.findMany({
                where: { userId: Number(req.query.userId) },
                select: { articleId: true }
            })
        )
        .map(({ articleId }) => articleId)

        articles = articles.map(article => ({
            ...article,
            isFavorite: favorites.includes(article.id) ? true : false 
        }))
    }

    return {
        category, 
        articles
    }
}


export const getArticles = catchAsyncErrors(async (req, res, next) => {
    const result = await getArticlesRecursive(req, res, next)

    if(typeof result === 'function') return result()

    res.status(200).json({
        success: true,
        result
    })
})


export const getArticlesByUserId = catchAsyncErrors(async (req, res, next) => {
    const userId = Number(req.query.userId)
    const limit = Number(req.query.limit) || 12
    const distinctId = Number(req.query.distinctId) || 0

    if(!userId) return next(new ErrorHandler('Por favor ingrese el campo: userId'))

    let articles = await prisma.article.findMany({
        where: {
            id: { 
                not: { 
                    equals: distinctId
                } 
            },
            userId,
            isPaused: false
        },
        select: {
            id: true,
            title: true,
            price: true,
            shipmentFree: true,
            pictures: {
                select: {
                    id: true,
                    link: true,
                }
            }
        },
        take: limit
    })

    if(!articles.length) return next(new ErrorHandler('No se encontraron artículos', 404))


    const favorites = (
        await prisma.favorite.findMany({
            where: { userId },
            select: { articleId: true }
        })
    )
    .map(({ articleId }) => articleId)

    articles = articles.map(article => ({
        ...article,
        isFavorite: favorites.includes(article.id) ? true : false 
    }))


    res.status(200).json({
        success: true,
        results: articles
    })
})


export const togglePauseArticle = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const articleId = Number(req.query.article_id)

    if(!articleId) 
        return next(new ErrorHandler('Por favor ingrese el campo: article_id', 400))


    const article = await prisma.article.findFirst({
        where: {
            id: articleId,
            userId
        },
        select: {
            _count: true,
            isPaused: true
        }
    })

    if(!article)
        return next(new ErrorHandler('No se encontró ningún artículo', 404))

    await prisma.article.update({
        where: { id: articleId },
        data: { isPaused: !article.isPaused }
    })

    res.status(200).json({
        success: true,
        message: !article.isPaused
            ? 'Artículo pausado con exito'
            : 'Artículo despausado con exito'
    })
})


export const searchArticleFilter = catchAsyncErrors(async (req, res, next) => {
    const { keyword, state, shipmentFree, category, news, price, page, limit } = req.query

    const queryParams = {}
    keyword      ? queryParams['keyword']      = keyword                        : null
    state        ? queryParams['state']        = state                          : null
    news         ? queryParams['news']         = news === 'true' ? true : false : null
    shipmentFree ? queryParams['shipmentFree'] = shipmentFree === 'true'        : null
    price        ? queryParams['price']        = price                          : null
    category     ? queryParams['category']     = category                       : null
    page         ? queryParams['page']         = Number(page)                   : null
    limit        ? queryParams['limit']        = Number(limit)                  : null

    const query = new ArticleFeatures(queryParams)
        .search()
        .filter()
        .paginate()

    res.status(200).json({
        success: true,
        result: {
            articlesQuantity: await query.getQuantity(prisma.article),
            articles: await query.run(prisma.article, prisma.favorite, req.query.userId)
        }
    })
})


export const articleDetails = catchAsyncErrors(async (req, res, next) => {
    const articleId = Number(req.query.id)

    if(!articleId) 
        return next(new ErrorHandler('Por favor ingrese el campo: id'))

    const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: {
            pictures: {
                select: {
                    id: true,
                    link: true
                }
            },
            user: {
                select: {
                    addresses: {
                        where: {
                            currentAddress: true
                        },
                        select: {
                            id: true,
                            state: true,
                            city: true,
                            parish: true
                        }
                    },
                }
            },
            questionInfo: {
                select: {
                    id: true,
                    questions: {
                        select: {
                            id: true,
                            question: true,
                            questionDate: true,
                            answer: true,
                            answerDate: true
                        }
                    }
                }
            },
            purchases: true
        }
    })

    const salesCount = await prisma.purchase.count({
        where: { userId: article.userId }
    })

    article.user.salesAchieved = salesCount

    article.isFavorite = (
        await prisma.favorite.findMany({
            where: { userId: Number(req.query.userId) || 0 },
            select: { articleId: true }
        })
    )
    .map(({ articleId }) => articleId)
    .includes(article.id) ? true : false

    res.status(200).json({
        success: true,
        result: article
    })
})