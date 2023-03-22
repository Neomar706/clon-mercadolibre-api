import { v2 as cloudinary } from 'cloudinary'


export const deleteFromDBAndCloudinary = async function(pictureModel, pictures4Delete, next){
    try {
        const pictures = await pictureModel.findMany({
            where: {
                link: {
                    in: pictures4Delete
                }
            }
        })
        
        await pictureModel.deleteMany({
            where: {
                link: {
                    in: pictures4Delete
                }
            }
        })

        await Promise.all(pictures.map(picture => cloudinary.uploader.destroy(picture.publicId)))

    } catch (err) {
        next(err)
    }
}