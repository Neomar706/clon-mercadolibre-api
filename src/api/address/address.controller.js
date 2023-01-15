import { pool } from '../../config/database'
import { catchAsyncErrors } from '../../middleware/catchAsyncErrors'
import { ErrorHandler } from '../../utils/errorHandler'
import { verifyRequiredFields } from '../../utils/verifyRequiredFields'


export const newAddress = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const requiredFields = ['state', 'city', 'municipality', 'parish', 'street', 'current_address']
    const [isOk, field] = verifyRequiredFields(req.body, requiredFields)

    if(!isOk) return next(new ErrorHandler(`Por favor ingrese el campo: ${field}`, 400))

    const { state, city, municipality, parish, street, current_address } = req.body
    const house_number = req.body?.house_number

    if(current_address){
        const sql = 'UPDATE addresses SET current_address = false WHERE user_id = ?;'
        await pool.query(sql, [userId])
    }

    const fields = '(user_id, state, city, municipality, parish, street, current_address, house_number)'
    const values = '(?, ?, ?, ?, ?, ?, ?, ?)'
    const query = `INSERT INTO addresses ${fields} VALUES ${values};`

    const [rows, _] = await pool.query(query, [userId, state, city, municipality, parish, street, current_address, house_number ?? null])

    if(!rows.affectedRows) return next(new ErrorHandler('No se pudo guardar la dirección', 500))

    res.status(200).json({
        success: true,
        message: '¡Listo! guardamos tu derección'
    })
})


export const getAddresses = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id

    const fields = 'id, state, city, municipality, parish, street, house_number, current_address'
    const query = `SELECT ${fields} FROM addresses WHERE user_id = ? ORDER BY id;`
    const [rows, _] = await pool.query(query, [userId])

    if(!rows.length) return next(new ErrorHandler('Aún no has registrado ningún domicilio', 400))

    const results = rows.map(row => ({
        id: row.id,
        state: row.state,
        city: row.city,
        municipality: row.municipality,
        parish: row.parish,
        street: row.street,
        house_number: row.house_number,
        current_address: Boolean(row.current_address)
    }))

    res.status(200).json({
        success: true,
        results
    })
})


export const updateAddress = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const addressId = req.query.id

    if(!addressId) return next(new ErrorHandler('Por favor ingrese el campo: id'))

    const objParams = {
        state: req.body.state,
        city: req.body.city,
        municipality: req.body.municipality,
        parish: req.body.parish,
        street: req.body.street,
        house_number: req.body.house_number,
        current_address: req.body.current_address
    }

    for(let key in objParams) 
        if(objParams[key] === undefined || objParams[key] === '') delete objParams[key]

    let query = 'UPDATE addresses SET '
    Object.keys(objParams).forEach(elem => query += `${elem} = ?, `)
    query = query.slice(0, query.length - 2)
    query += ' WHERE id = ? AND user_id = ?;'

    console.log({query})
    console.log([...Object.values(objParams), addressId, userId])

    const [result, _] = await pool.query(query, [...Object.values(objParams), addressId, userId])

    if(!result.affectedRows) return next(new ErrorHandler('No se pudo actualizar el domicilio', 400))

    res.status(200).json({
        success: true,
        message: '¡Listo! actulizamos tu domicilio'
    })
})


export const deleteAddress = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id
    const addressId = req.query.id

    const query = 'DELETE FROM addresses WHERE id = ? AND user_id = ? AND current_address = false;'
    const [result, _] = await pool.query(query, [addressId, userId])

    if(!result.affectedRows) return next(new ErrorHandler('No se pudo eliminar el domicilio', 400))
    res.status(200).json({
        success: true,
        message: '¡Listo! eliminamos el domicilio'
    })
})