

export const withoutPicturesOfDatabase = function(arrayOfPictures){
    const arrayRet = arrayOfPictures.filter(pictureLink => !pictureLink.includes('https://res.cloudinary.com'))
    return arrayRet
}