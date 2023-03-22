

export const ArticleFeatures = class {
    constructor(queryParams){
        this.query = ''
        this.queryParams = queryParams
    }

    search(){
        this.query = {
            where: {
                isPaused: false
            },
            select: {
                id: true,
                title: true,
                price: true,
                shipmentFree: true,
                isNew: true,
                user: {
                    select: {
                        addresses: {
                            where: {
                                currentAddress: true
                            },
                            select: {
                                id: true,
                                state: true
                            }
                        }   
                    }
                },
                categories: true,
                pictures: {
                    select: {
                        id: true,
                        link: true
                    }
                }
            }
        }

        return this
    }

    filter(){
        if(this.queryParams.keyword){
            const keyword = this.queryParams.keyword
            this.query.where = {
                ...this.query.where,
                title: {
                    contains: keyword
                }
            }
        }

        if(this.queryParams.category){
            const category = this.queryParams.category
            this.query.where = {
                ...this.query.where,
                categories: {
                    some: {
                        category
                    }
                }
            }
        }

        if(this.queryParams.state){
            const state = this.queryParams.state
            this.query.where = {
                ...this.query.where,
                user: {
                    addresses: {
                        some: {
                            state,
                            currentAddress: true
                        }
                    }
                }
            }
        }
        
        if(this.queryParams.shipmentFree){
            const shipmentFree = this.queryParams.shipmentFree
            this.query.where = {
                ...this.query.where,
                shipmentFree
            }
        }

        if(this.queryParams.news){
            const isNew = this.queryParams.news
            this.query.where = {
                ...this.query.where,
                isNew
            }
        }

        if(this.queryParams.price?.lte){
            const lte = Number(this.queryParams.price.lte)
            this.query.where = {
                ...this.query.where,
                price: {
                    lte
                }
            }
        }

        if(this.queryParams.price?.gte){
            const gte = Number(this.queryParams.price.gte)
            this.query.where = {
                ...this.query.where,
                price: {
                    gte
                }
            }
        }

        return this
    }

    paginate(){
        const limit = this.queryParams.limit ?? 15
        const page = this.queryParams.page ?? 1
        const offset = (page - 1) * limit

        this.query.take = limit
        this.query.skip = offset
        return this
    }

    async getQuantity(articleModel){
        const query = JSON.parse(JSON.stringify(this.query))
        delete query.select
        delete query.skip
        delete query.take
        return await articleModel.count(query)
    }

    async run(articleModel, favoriteModel, userId){
        let articles = await articleModel.findMany(this.query)
        if(userId){
            const favorites = (await favoriteModel.findMany({
                where: { userId: Number(userId) },
                select: { articleId: true }
            })).map(({ articleId }) => articleId)
    
            articles = articles.map(article => ({
                ...article,
                isFavorite: favorites.includes(article.id) ? true : false 
            }))
        }
        return articles
    }
}