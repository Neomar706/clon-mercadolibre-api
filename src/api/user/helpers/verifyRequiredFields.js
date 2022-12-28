

export const verifyRequiredFields = function(reqBody, requiredFields){

    const objCopy = JSON.parse(JSON.stringify(reqBody))
    for(let key in objCopy) if(objCopy[key] === undefined) delete objCopy[key]
    
    let field = ''
    let isOk = true

    requiredFields.forEach(elem => {
        if(Object.keys(objCopy).indexOf(elem) < 0){
            field = elem
            isOk = false
            return
        }
    })

    return [isOk, field]
}