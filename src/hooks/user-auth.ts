import { FastifyRequest } from "fastify"


export const verifyUserAuth = async (req:FastifyRequest, reply) => {
   try {
      await req.jwtVerify()
    } catch (err) {
       reply.send(err)
    }
}

export const checkUserIsAdmin = async (req:FastifyRequest, reply) => {
   try {
      const {role} = await req.jwtVerify()
      role != 'ADMIN' && reply.send({message: 'Ограничение доступа!'})
    } catch (err) {
      reply.send(err)
    }
}
