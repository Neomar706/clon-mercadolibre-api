import { v2 as cloudinary } from 'cloudinary'
import { pool } from '../../config/database'

import { catchAsyncErrors } from '../../middleware/catchAsyncErrors'
import { ErrorHandler } from '../../utils/errorHandler'
import { verifyRequiredFields } from '../../utils/verifyRequiredFields'


export const createArticle = catchAsyncErrors(async (req, res, next) => {
    const requiredFields = ['title', 'brand', 'model', 'is_new', 'stock', 'price', 'shipment_free', 'days_warranty', 'description', 'images', 'categories']
    const [isOk, field] = verifyRequiredFields(req.body, requiredFields)

    if(!isOk) return next(new ErrorHandler(`Por favor ingrese el campo: ${field}`))

    const { id } = req.user
    const { title, brand, model, is_new, stock, price, shipment_free, days_warranty, description } = req.body
    const { images, categories } = req.body

    const imagesLinks = []

    for(let i = 0; i < images.length; i++){
        const result = await cloudinary.uploader.upload(images[i], {
            folder: 'articles'
        })

        imagesLinks.push({
            public_id: result.public_id,
            link: result.secure_url
        })
    }

    const query = `INSERT INTO articles (user_id, title, brand, model, is_new, stock, price, shipment_free, days_warranty, description)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
    const [result, _] = await pool.query(query, [id, title, brand, model, is_new, stock, price, shipment_free, days_warranty, description])
    const article_id = result.insertId

    const queryDeleteArticle = 'DELETE FROM articles WHERE id = ?;'

    try {
        const sql = 'INSERT INTO pictures (article_id, public_id, link) VALUES (?, ?, ?);'
        await Promise.all(imagesLinks.map(image => pool.query(sql, [article_id, image.public_id, image.link])))
    } catch (err) {
        await pool.query(queryDeleteArticle, [article_id])
        return next(new ErrorHandler(err.message, 500))
    }

    try {
        const sql = 'INSERT INTO articles_categories (article_id, category_id) VALUES (?, ?);'
        await Promise.all(categories.map(category => pool.query(sql, [article_id, category])))
    } catch (err) {
        await pool.query(queryDeleteArticle, [article_id])
        return next(new ErrorHandler(err.message, 500))
    }
    
    res.status(200).json({
        success: true,
        message: 'Artículo publicado con éxito'
    })
})


export const deleteArticle = catchAsyncErrors(async (req, res, next) => {
    const articleId = req.query.id
    const userId = req.user.id

    if(!articleId) return next(new ErrorHandler('Por favor ingrese el campo: id'))

    const query = 'SELECT public_id FROM pictures WHERE article_id = ?;'
    const [rows, _] = await pool.query(query, [articleId])

    const _query = 'DELETE FROM articles WHERE id = ? AND user_id = ?;'
    const [result, __] = await pool.query(_query, [articleId, userId])

    if(!result.affectedRows) return next(new ErrorHandler('No se encontró ningún artículo', 404))
    await Promise.all(rows.map(row => cloudinary.uploader.destroy(row.public_id)))
    
    res.status(200).json({
        success: true,
        message: 'Artículo se eliminado con éxito'
    })
})


export const updateArticle = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const articleId = req.query.id

    if(!articleId) return next(new ErrorHandler('Por favor ingrese el campo: id'))

    const query = 'SELECT id FROM articles WHERE id = ? AND user_id = ?;'
    const [rows, _] = await pool.query(query, [articleId, userId])

    if(!rows[0]) return next(new ErrorHandler('No se encontró ningún artículo', 400))

    const objParams = {
        title: req.body.title,
        brand: req.body.brand,
        model: req.body.model,
        is_new: req.body.is_new,
        stock: req.body.stock,
        price: req.body.price,
        shipment_free: req.body.shipment_free,
        days_warranty: req.body.days_warranty,
        description: req.body.description
    }

    for(let key in objParams) if(objParams[key] === undefined) delete objParams[key]

    let _query = 'UPDATE articles SET '
    Object.keys(objParams).forEach(elem => _query += `${elem} = ?, `)
    _query = _query.slice(0, _query.length - 2)
    _query += ' WHERE id = ?;'

    const [result, __] = await pool.query(_query, [...Object.values(objParams), articleId])

    if(!result.affectedRows) return next(new ErrorHandler('No se pudo actualizar el artículo'))

    if(req.body.images){
        const query = 'SELECT public_id FROM pictures WHERE article_id = ?;'
        const [rows, _] = await pool.query(query, [articleId])
        await Promise.all(rows.map(row => cloudinary.uploader.destroy(row.public_id)))

        const imagesLinks = []
        const images = req.body.images
        for(let i = 0; i < images.length; i++){
            const result = await cloudinary.uploader.upload(images[i], {
                folder: 'articles'
            })

            imagesLinks.push({
                public_id: result.public_id,
                link: result.secure_url
            })
        }

        const _query = 'DELETE FROM pictures WHERE article_id = ?;'
        const [result, __] = await pool.query(_query, [articleId])
        
        if(result.affectedRows){
            const query = 'INSERT INTO pictures (article_id, public_id, link) VALUES (?, ?, ?);'
            await Promise.all(imagesLinks.map(image => pool.query(query, [articleId, image.public_id, image.link])))
        }
    }

    if(req.body.categories){
        const query = 'DELETE FROM articles_categories WHERE article_id = ?;'
        const [result, _] = await pool.query(query, [articleId])

        const categories = req.body.categories
        if(result.affectedRows){
            const _query = 'INSERT INTO articles_categories (article_id, category_id) VALUES (?, ?);'
            await Promise.all(categories.map(category => pool.query(_query, [articleId, category])))
        }
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

    const sql = 'SELECT DISTINCT(c.category) FROM categories c, articles_categories ac WHERE c.id = ac.category_id;'
    const [rows, _] = await pool.query(sql)
    const distinctCategories = rows.map(row => row.category)

    const hasError = distinctCategories.every(elem => distinct_of.indexOf(elem) !== -1)
    if(hasError) return () => next(new ErrorHandler('No se encontró ningún artículo', 404))
    
    let query = 'SELECT category FROM categories WHERE category NOT IN ('
    distinct_of.forEach(() => query += '?, ')
    query = query.slice(0, query.length - 2)
    query += ') ORDER BY RAND() LIMIT 1;'

    const [_rows, __] = await pool.query(query, [...distinct_of])
    const category = _rows[0]?.category

    if(!category) return () => next(new ErrorHandler('No se encontró ningún artículo', 404))

    const _query = `
        SELECT a.id AS article_id, a.title, a.price, a.shipment_free, p.id AS img_id, p.article_id AS img_article_id, p.link AS img_url, c.category
        FROM articles a
        INNER JOIN pictures p
        ON a.id = p.article_id
        INNER JOIN articles_categories ac
        ON a.id = ac.article_id
        INNER JOIN categories c
        ON ac.category_id = c.id
        WHERE c.category = (?) AND a.is_paused = false
        ORDER BY article_id ASC;
    `
    const [result, ___] = await pool.query(_query, [category])

    if(!result.length) return await getArticlesRecursive(req, res, next)
    return result
}

const obtainRows = async function(req, res, next){
    const result = await getArticlesRecursive(req, res, next)

    if(typeof result === 'function') return result()

    const ret = result.reduce((acc, current) => {
        const info = {
            id: current.article_id,
            title: current.title,
            price: current.price,
            shipment_free: Boolean(current.shipment_free),
            images: []
        }

        const images = {
            id: current.img_id,
            url: current.img_url
        }

        if(!acc.some(elem => elem.id === info.id)) acc.push(info)
        acc.forEach(elem => elem.id === current.img_article_id && elem.images.push(images))

        return acc
    }, [])

    res.status(200).json({
        success: true,
        result: {
            category: result[0].category,
            articles: ret
        },
    })
}

export const getArticles = catchAsyncErrors(obtainRows)


export const togglePauseArticle = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const articleId = req.query.article_id

    if(!articleId) return next(new ErrorHandler('Por favor ingrese el campo: article_id', 400))

    const query = 'SELECT is_paused FROM articles WHERE id = ? AND user_id = ?;'
    const [rows, _] = await pool.query(query, [articleId, userId])

    if(!rows[0]) return next(new ErrorHandler('No se encontró ningún artículo', 404))
    const isPaused = rows[0].is_paused

    const _query = 'UPDATE articles SET is_paused = ? WHERE id = ?;'
    await pool.query(_query, [!isPaused, articleId])

    res.status(200).json({
        success: true,
        message: !isPaused
            ? 'Artículo pausado con exito'
            : 'Artículo despausado con exito'
    })
})