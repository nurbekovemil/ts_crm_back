import { FastifyRequest } from "fastify"


export const verifyUserAuth = async (req:FastifyRequest, reply) => {
   try {
      await req.jwtVerify()
    } catch (err) {
       reply.send(err)
    }
}
