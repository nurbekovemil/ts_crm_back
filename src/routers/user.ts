import { FastifyInstance } from "fastify"
import * as bcrypt from 'bcrypt'

// user types
import { 
   userGetAllListQuery, 
   userGetAllListResponse, 
   userBodyReguest, 
   userLoginResponse, 
   userMessageResponse,
   userQueryById,

} from "../types/user"

// user route schemas
import { 
   userBodyRequestLoginSchema, 
   userBodyRequestSchema,
   userGetAllListSchema,
   userDeleteByIdSchema
} from "../schemas/user"
import { verifyUserAuth } from "../hooks/user-auth"


const userRouters =  async (app: FastifyInstance) => {
   // user authentication
   app.post('/login',
   {
      schema: userBodyRequestLoginSchema
   }, async (req: userBodyReguest): Promise<userLoginResponse> => {
      try {
         const {
            username, 
            password
         } = req.body

         const user = await app.pg.query('select * from users where username = $1', [username])
         if(user.rowCount == 0) {
            throw new Error(`Пользователь ${username} не найден!`)
         }
         
         const comparePassword: boolean = await bcrypt.compare(password, user.rows[0].password)
         if(!comparePassword){
            throw new Error('Не верный пароль')
         }
         const token = app.jwt.sign({id: user.rows[0].id})
         console.log(token)
         return {
            username: user.rows[0].username, 
            token
         }

      } catch (error) {
         return error
      }
   })
   // create user
   app.post('/create', 
   {
      preHandler: [verifyUserAuth],
      schema: userBodyRequestSchema,
   }, 
   async (req: userBodyReguest):Promise<userMessageResponse> => {
      try {
         const {
            username, 
            password
         } = req.body
         const user = await app.pg.query('select username from users where username = $1', [username])
         if(user.rowCount > 0) {
            throw new Error(`Пользователь ${username} уже существует!`)
         }
         const hashPassword: string = await bcrypt.hash(password, 5)
         await app.pg.query('insert into users (username, password) values ($1, $2)', [username, hashPassword])
         return {
            message: `Пользователь ${username} успешно создан!`
         }
      } catch (error) {
         return error
      }
   })
   // get all user list
   app.get<{Querystring: userGetAllListQuery}>('/',
   {
      preHandler: [verifyUserAuth],
      schema: userGetAllListSchema
   },
   async (req):Promise<Array<userGetAllListResponse>> => {
      try {
         let {limit, page} = req.query
         limit = limit || 10
         page = page || 1
         let offset: number = page * limit - limit
         const users = await app.pg.query('select id, username from users limit $1 offset $2', [limit, offset])
         return users.rows
      } catch (error) {
         app.log.error(error)
      }
   })
   app.get('/me', 
   {
      preHandler: verifyUserAuth
   }, async (req) =>  {
      try {
         const {id}= req.user
         const user = await app.pg.query('select * from users where id = $1', [id])
         if(user.rowCount == 0) {
            throw new Error('Произошла ошибка при получении данных пользователя!')
         }
         return {username: user.rows[0].username}
      } catch (error) {
         return error
      }
   })
   app.put('/',
   {
      preHandler: [verifyUserAuth],
      schema: userBodyRequestSchema
   }, async (req: userBodyReguest): Promise<userMessageResponse> => {
      try {
         const {id, username, password} = req.body
         const hashPassword = bcrypt.hash(password, 5)
         await app.pg.query('update users set username = $1, password = $2 where id = $3', [username, hashPassword, id], (err) => {
            if(err){
               throw new Error('Ошибка при обновлении')
            }
         })
         return {message: 'Данные успешно обновлены!'}
      } catch (error) {
         return error
      }
   })

   app.delete<{Querystring: userQueryById}>('/:id', 
   {
      preHandler: [verifyUserAuth],
      schema:userDeleteByIdSchema
   }, async (req):Promise<userMessageResponse> => {
      try {
         const {id} = req.query
         await app.pg.query('delete from users where id = $1', [id], (err) => {
            if(err) {
               throw new Error('Ошибка при удалении!')
            }
         })
         return {message: 'Пользовател успешно удален!'}
      } catch (error) {
         return error
      }
   })
}

export default userRouters