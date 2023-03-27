import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const getSession = async function(sid){
    const session = await prisma.session.findUnique({
        where: { id: sid }
    })
    return session ? JSON.parse(session.data) : null
}

const setSession = async function(sid, data){
    await prisma.session.upsert({
        where: { id: sid },
        update: { data: JSON.stringify(data) },
        create: { sid, data: JSON.stringify(data) }
    })
    return data
}

const destroySession = async function(sid){
    await prisma.session.delete({
        where: { id: sid }
    })
}


export const PrismaSessionStore = class {
    async get(sid, callback){
        getSession(sid)
            .then(session => callback(null, session))
            .catch(err => callback(err))
    }

    async set(sid, session, callback){
        setSession(sid, session)
            .then(() => callback())
            .catch(err => callback(err))
    }

    async destroy(sid, callback){
        destroySession(sid)
            .then(() => callback())
            .catch(err => callback(err))
    }
}