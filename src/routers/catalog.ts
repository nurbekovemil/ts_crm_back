import { FastifyInstance } from "fastify"

import { 
    verifyUserAuth
 } from "../hooks/user-auth"

const catalogRouters = async (app: FastifyInstance) =>{

    app.get('/', getTnvedCategories)

}

async function test(req) {
  return await this.catalogHandlers.test()
}

async function getTnvedCategories (req) {
  const {page} = req.query
  const tnved = await this.catalogHandlers.getTnvedCategories(page)
  return tnved
}


export default catalogRouters