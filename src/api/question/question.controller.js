import { PrismaClient } from '@prisma/client'
import { catchAsyncErrors } from '../../middleware/catchAsyncErrors'
import { ErrorHandler } from '../../utils/errorHandler'
import { verifyRequiredFields } from '../../utils/verifyRequiredFields'


const prisma = new PrismaClient()

export const makeQuestion = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const articleId = req.query.articleId ? Number(req.query.articleId) : undefined
    const link = req.body.link
    const question = req.body.question

    const [isOk, field] = verifyRequiredFields(
        { articleId, link, question },
        ['articleId', 'link', 'question']
    )

    if(!isOk) 
        return next(new ErrorHandler(`Por favor ingrese el campo: ${field}`, 400))
    
    const article = await prisma.article.findFirst({
        where: { id: articleId }
    })

    if(article.userId == userId) 
        return next(new ErrorHandler('No puedes preguntar en un artículo publicado por tí', 400))
        
    const currentQuestionInfo = await prisma.questionsInfo.findFirst({
        where: {
            articleId,
            userId
        },
        select: {
            id: true,
            article: {
                select: {
                    userId: true
                }
            }
        }
    })

    await prisma.question.create({
        data: {
            question,
            questionsInfo: {
                connectOrCreate: {
                    where: {
                        id: currentQuestionInfo?.id ?? 0
                    },
                    create: {
                        articleId,
                        userId,
                        link,
                    }
                }
            }
        }
    })

    res.status(200).json({
        success: true,
        message: '¡LISTO! Enviamos tu pregunta' 
    })
})


export const makeAnswer = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const articleId = req.query.articleId ? Number(req.query.articleId) : undefined
    const questionId = req.query.questionId ? Number(req.query.questionId) : undefined
    const answer = req.body.answer

    const [isOk, field] = verifyRequiredFields(
        { articleId, questionId, answer },
        ['articleId', 'questionId', 'answer']
    )

    if(!isOk) 
        return next(new ErrorHandler(`Por favor ingrese el campo: ${field}`, 400))

    const questionsInfo = await prisma.questionsInfo.findFirst({
        where: {
            article: {
                userId
            },
            articleId
        },
        select: {
            id: true
        }
    })

    if(!questionsInfo) 
        return next(new ErrorHandler('No se encontró la pregunta que deseas responder', 404))

    await prisma.question.update({
        where: { id: questionId },
        data: {
            answer,
            answerDate: new Date()
        }
    })

    res.status(201).json({
        success: true,
        message: '¡LISTO! Enviamos tu respuesta'
    })
})


export const getQuestions = catchAsyncErrors(async (req, res, next) => {
    const articleId = req.query.articleId ? Number(req.query.articleId) : undefined

    if(!articleId) 
        return next(new ErrorHandler('Por favor ingrese el campo: articleId', 400))


    const questions = await prisma.question.findMany(
        {
            where: {
                questionsInfo: {
                    articleId,
                    userId: req.query.userId ? {
                        not: {
                            equals: Number(req.query.userId)
                        }
                    } : {}
                },
                answer: {
                    not: {
                        equals: null
                    }
                }
            },
            select: {
                id: true,
                question: true,
                questionDate: true,
                answer: true,
                answerDate: true
            }
        }
    )

    res.status(200).json({
        success: true,
        results: questions
    })
})


export const getUnansweredQuestions = catchAsyncErrors(async (req, res, next) => {
    const questions = await prisma.question.findMany({
        where: {
            answer: null
        },
        select: {
            id: true,
            question: true,
            questionDate: true,
            answer: true,
            answerDate: true
        }
    })
    
    if(!questions.length) 
        return next(new ErrorHandler('No hay preguntas sin responder', 404))

    res.status(200).json({
        success: true,
        results: questions
    })
})


export const getMyQuestions = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const articleId = req.query.articleId ? Number(req.query.articleId) : undefined

    const myQuestions = await prisma.question.findMany({
        where: {
            questionsInfo: {
                userId,
                articleId
            }
        },
        select: {
            id: true,
            question: true,
            questionDate: true,
            answer: true,
            answerDate: true
        }
    })
    
    if(!myQuestions.length) 
        return next(new ErrorHandler('No se encontraron preguntas', 404))
    
    res.status(200).json({
        success: true,
        results: myQuestions
    })
})