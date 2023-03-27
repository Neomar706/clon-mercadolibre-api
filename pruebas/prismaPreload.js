const { PrismaClient } = require('@prisma/client')
const prismaData = require('./preloadPrisma.json')
const cloudinary = require('cloudinary').v2

const prisma = new PrismaClient()

cloudinary.config({ 
    cloud_name: "dlqevww9k", 
    api_key: "684822317913867", 
    api_secret: "vxugXyomlcGMprbcoyYC9evFZd4",
    secure: true
})


const uploadImages = async function(images){
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
    return imagesLinks
}

const main = async function(){
    const users = prismaData.users
    for(let i = 0; i < users.length; i++){
        await prisma.user.create({
            data: {
                ...users[i],
                addresses: {
                    create: users[i].addresses
                }
            }
        })
    }

    await prisma.category.createMany({
        data: prismaData.categories
    })

    const START_INDEX = 0
    const articles = prismaData.articles
    for(let i = START_INDEX; i < articles.length-1; i++){
        await prisma.article.create({
            data: {
                id: articles[31].id,
                userId: articles[31].userId,
                title: articles[31].title,
                brand: articles[31].brand,
                model: articles[31].model,
                isNew: articles[31].isNew,
                isPaused: articles[31].isPaused,
                stock: articles[31].stock,
                price: articles[31].price,
                shipmentFree: articles[31].shipmentFree,
                daysWarranty: articles[31].daysWarranty,
                description: articles[31].description,
                pictures: { create: await uploadImages(articles[31].pictures) },
                categories: { connect: articles[31].categories.map(id => ({ id })) }
            }
        })
    }
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