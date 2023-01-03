import { pool } from '../../config/database'
import { catchAsyncErrors } from '../../middleware/catchAsyncErrors'
import { ErrorHandler } from '../../utils/errorHandler'


export const getCategories = catchAsyncErrors(async (req, res, next) => {
    const query = 'SELECT * FROM categories;'
    const [rows, _] = await pool.query(query)

    res.status(200).json({
        success: true,
        results: rows
    })
})


export const getCategory = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.query

    if(!id) return next(new ErrorHandler('Por favor ingrese el campo: id', 400))

    const query = 'SELECT * FROM categories WHERE id = ?;'
    const [rows, _] = await pool.query(query, [id])

    res.status(200).json({
        success: true,
        result: rows[0]
    })
})


export const createCategory = catchAsyncErrors(async (req, res, next) => {
    const { category_name } = req.body

    if(!category_name) return next(new ErrorHandler('Por favor ingrese el campo: category_name', 400))

    const query = 'INSERT INTO categories (category) VALUES (?);'
    const [_, __] = await pool.query(query, [category_name])

    console.log(_)

    res.status(200).json({
        success: true,
        message: 'Categoría creada con exito'
    })
})


export const deleteCategory = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.query

    if(!id) return next(new ErrorHandler('Por favor ingrese el campo: id', 400))

    const query = 'DELETE FROM categories WHERE id = ?;'
    const [_, __] = await pool.query(query, [id])

    res.status(200).json({
        success: true,
        message: 'Categoría eliminada con exito'
    })
})


export const updateCategory = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.query
    const { category_name } = req.body

    if(!id) return next(new ErrorHandler('Por favor ingrese el campo: id'))
    if(!category_name) return next(new ErrorHandler('Por favor ingrese el campo: category_name'))

    const query = 'UPDATE categories SET category = ? WHERE id = ?;'
    const [_, __] = await pool.query(query, [category_name, id])


    res.status(200).json({
        success: true,
        message: 'Categoría actualizada con exito'
    })
})