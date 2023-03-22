

export const verifyRequiredFields = function(reqBody, requiredFields){

    const obj = JSON.parse(JSON.stringify(reqBody))
    for(let key in obj) if(obj[key] === undefined) delete obj[key]
    
    let field = ''
    let isOk = true

    requiredFields.forEach(elem => {
        if(Object.keys(obj).indexOf(elem) < 0){
            field = elem
            isOk = false
            return
        }
    })

    return [isOk, field]
}