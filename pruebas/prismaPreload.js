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
    // const users = prismaData.users
    // for(let i = 0; i < users.length; i++){
    //     await prisma.user.create({
    //         data: {
    //             ...users[i],
    //             addresses: {
    //                 create: users[i].addresses
    //             }
    //         }
    //     })
    // }

    // await prisma.category.createMany({
    //     data: prismaData.categories
    // })

    const START_INDEX = 0
    const articles = prismaData.articles
    for(let i = START_INDEX; i < articles.length; i++){
        await prisma.article.create({
            data: {
                id: articles[i].id,
                userId: articles[i].userId,
                title: articles[i].title,
                brand: articles[i].brand,
                model: articles[i].model,
                isNew: articles[i].isNew,
                isPaused: articles[i].isPaused,
                stock: articles[i].stock,
                price: articles[i].price,
                shipmentFree: articles[i].shipmentFree,
                daysWarranty: articles[i].daysWarranty,
                description: articles[i].description,
                pictures: { create: await uploadImages(articles[i].pictures) },
                categories: { connect: articles[i].categories.map(id => ({ id })) }
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