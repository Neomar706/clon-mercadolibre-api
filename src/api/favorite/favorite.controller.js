import { pool } from '../../config/database'
import { catchAsyncErrors } from '../../middleware/catchAsyncErrors'
import { ErrorHandler } from '../../utils/errorHandler'


export const addArticleToFavotite = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const articleId = req.query.article_id

    if(!articleId) return next(new ErrorHandler('Por favor ingrese el campo: article_id', 400))

    const _query = 'SELECT id FROM favorites WHERE article_id = ?;'
    const [_rows, __] = await pool.query(_query, [articleId])
    if(_rows[0]?.id) return next(new ErrorHandler('El artículo ya se encuentra en tus favoritos', 409))
    
    const query = 'SELECT title FROM articles WHERE id = ?;'
    const [rows, _] = await pool.query(query, [articleId])
    if(!rows[0]) return next(new ErrorHandler('No se encontró ningún artículo', 404))

    const articleTitle = rows[0].title
    const favoriteLink = `/article?id=${articleId}&article_name=${articleTitle}`

    const sql = 'INSERT INTO favorites (user_id, article_id, link) VALUES (?, ?, ?);'
    await pool.query(sql, [userId, articleId, favoriteLink])

    res.status(200).json({
        success: true,
        message: 'Artículo añadido a favoritos'
    })
})


export const removeArticleFromFavorite = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const articleId = req.query.article_id

    if(!articleId) return next(new ErrorHandler('Por favor ingrese el campo: article_id', 400))

    const query = 'DELETE FROM favorites WHERE article_id = ? AND user_id = ?;'
    const [rows, _] = await pool.query(query, [articleId, userId])

    if(!rows.affectedRows) return next(new ErrorHandler('No se encontró ningún artículo', 404))

    res.status(200).json({
        success: true,
        message: '¡LISTO! eliminamos tu favorito'
    })
})


export const getArticlesFromFavorite = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const limit = req.query.limit

    let query = `
        SELECT f.id, a.title, a.price, CONCAT(?, a.id, '&article_name=', a.title) AS article_url, p.link AS img_url
        FROM favorites f, articles a, pictures p
        WHERE f.article_id = a.id AND a.id = p.article_id AND f.user_id = ?
        GROUP BY a.id
    `

    const params = ['/article?id=', userId]

    if(limit){
        query += '\nLIMIT ?;'
        params.push(Number(limit))
    } else query += ';'

    const [rows, _] = await pool.query(query, params)

    if(!rows.length) return next(new ErrorHandler('No se encontró ningún artículo', 404))

    res.status(200).json({
        success: true,
        results: rows
    })
})