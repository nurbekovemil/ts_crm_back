import { FastifyInstance } from "fastify"
import * as bcrypt from 'bcrypt'

// user types
import { 
   userGetAllListQuery, 
   userGetAllListResponse, 
   userBodyReguest,
   userUpdateReguest,
   userLoginResponse, 
   userMessageResponse,
   userGetMe,
} from "../types/user"

// user schemas
import { 
   userBodyRequestLoginSchema, 
   userBodyRequestUpdateSchema,
   userBodyReguestCreateSchema,
   userGetAllListSchema,
} from "../schemas/user"

import { 
   verifyUserAuth 
} from "../hooks/user-auth"



const userRouters =  async (app: FastifyInstance) => {

   app.post('/login',{
      schema: userBodyRequestLoginSchema
   }, userLogin)
   
   app.post('/', {
      preHandler: [verifyUserAuth],
      schema: userBodyReguestCreateSchema,
   }, userCreate)
   
   app.get<{Querystring: userGetAllListQuery}>('/',
   {
      preHandler: [verifyUserAuth],
      schema: userGetAllListSchema
   }, userGetAllList)

   app.get('/me', {
      preHandler: [verifyUserAuth]
   }, userGetMeH)

   app.put('/',{
      preHandler: [verifyUserAuth],
      schema: userBodyRequestUpdateSchema
   }, userUpdate)

   app.delete('/:id', 
   {
      preHandler: [verifyUserAuth],
   }, userDelete)
}

   
async function userLogin(req: userBodyReguest):Promise<userLoginResponse>  {
   const {
      username, 
      password
   } = req.body
   return await this.userHandlers.userLogin(username, password)
}

async function userCreate(req: userBodyReguest):Promise<userMessageResponse> {
   const {
      username, 
      password
   } = req.body
   return await this.userHandlers.userCreate(username, password)
}

async function userGetMeH(req): Promise<userGetMe> {
   const {id}= req.user
   return await this.userHandlers.userGetMe(id)
}

async function userUpdate(req: userUpdateReguest):Promise<userMessageResponse> {
   const {id, username, password} = req.body
   return await this.userHandlers.userUpdate(id, username, password)
}

async function userDelete(req):Promise<userMessageResponse> {
   const {id} = req.params
   return await this.userHandlers.userDelete(id)
}

async function userGetAllList(req):Promise<Array<userGetAllListResponse>> {
   let {limit, page} = req.query
   limit = limit || 10
   page = page || 1
   let offset: number = page * limit - limit
   return await this.userHandlers.userGetAllList(limit, offset)
}

export default userRouters