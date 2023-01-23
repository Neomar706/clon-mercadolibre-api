import { pool } from '../../../config/database'


export const ArticleFeatures = class {
    constructor(queryParams){
        this.query = ''
        this.queryParams = queryParams
        this.params = []
    }

    search(){
        this.query += `
            SELECT a.id, a.title, a.price, a.shipment_free, a.is_new, ad.state, CONCAT('[',
                (SELECT CONCAT(GROUP_CONCAT('{"id": ', c.id, ', "category": "', c.category, '"}'))
                FROM categories c, articles_categories ac
                WHERE a.id = ac.article_id AND c.id = ac.category_id)
            , ']') categories, CONCAT('[',
                (SELECT CONCAT(GROUP_CONCAT('{"id": ', p.id, ', "url": "', p.link, '"}'))
                FROM pictures p
                WHERE a.id = p.article_id)
            , ']') images
            FROM articles a
            JOIN articles_categories ac ON a.id = ac.article_id
            JOIN categories c ON c.id = ac.category_id
            JOIN addresses ad ON a.user_id = ad.user_id
            WHERE a.is_paused = false
            GROUP BY a.id
            ORDER BY a.id
            LIMIT ?, ?;
        `
        return this
    }

    concatSQLWith(value, param){
        this.query = this.query.replace('a.is_paused = false', `${value} AND a.is_paused = false`)
        this.params.push(param)
    }

    filter(){
        if(this.queryParams.keyword) this.concatSQLWith('a.title LIKE ?', `%${this.queryParams.keyword}%`)
        if(this.queryParams.category_id) this.concatSQLWith('c.id = ?', this.queryParams.category_id)
        if(this.queryParams.state) this.concatSQLWith('ad.state = ?', this.queryParams.state)
        if(this.queryParams.shipment_free) this.concatSQLWith('a.shipment_free = ?', this.queryParams.shipment_free)        
        if(this.queryParams.news !== undefined) this.concatSQLWith('a.is_new = ?', this.queryParams.news)        
        if(this.queryParams.price?.gte) this.concatSQLWith('a.price >= ?', Number(this.queryParams.price.gte))        
        if(this.queryParams.price?.lte) this.concatSQLWith('a.price <= ?', Number(this.queryParams.price.lte))    

        return this
    }

    paginate(){
        const limit = this.queryParams.limit ?? 15
        const page = this.queryParams.page ?? 1
        const offset = (page - 1) * limit

        this.params.push(offset, limit)
        return this
    }

    async getQuantity(){
        let sql = 'SELECT COUNT(*) articles_quantity FROM (SELECT DISTINCT(a.id)' + this.query.slice(553)
            sql = sql.slice(0, -59) + ') T;'
        return (await pool.query(sql, this.params))[0][0].articles_quantity
    }

    async run(){
        return (await pool.query(this.query, this.params))[0].map(row => ({
            ...row,
            shipment_free: Boolean(row.shipment_free),
            is_new: Boolean(row.is_new),
            categories: JSON.parse(row.categories.replaceAll('\"', '"')),
            images: JSON.parse(row.images.replaceAll('\"', '"'))
        }))
    }
}