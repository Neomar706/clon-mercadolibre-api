

export const randomCategory = async function(categoryModel, distinctOf){
    const categoryCount = await categoryModel.count({
        where: {
            category: {
                notIn: distinctOf
            }
        }
    })
    const skip = Math.floor(Math.random() * categoryCount)
    const category = (await categoryModel.findFirst({
        where: {
            category: {
                notIn: distinctOf
            }
        },
        skip
    })).category
    return category
}