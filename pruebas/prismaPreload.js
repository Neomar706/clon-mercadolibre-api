const { PrismaClient } = require('@prisma/client')
const prismaData = require('./preloadPrisma.json')

const prisma = new PrismaClient()
const main = async function(){

    await prisma.user.createMany({
        data: prismaData.users
    })

    await prisma.category.createMany({
        data: prismaData.categories
    })

    prismaData.articles.forEach(async article => {
        await prisma.article.create({
            data: {
                id: article.id,
                userId: article.userId,
                title: article.title,
                brand: article.brand,
                model: article.model,
                isNew: article.isNew,
                isPaused: article.isPaused,
                stock: article.stock,
                price: article.price,
                shipmentFree: article.shipmentFree,
                daysWarranty: article.daysWarranty,
                description: article.description,
                pictures: { create: article.pictures },
                categories: { connect: article.categories.map(id => ({ id })) },
                favorites: { create: article.favorites }          
            }
        })
    })

}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async e => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
