import fastify, {FastifyServerOptions} from 'fastify'
import fastifyPostgres from 'fastify-postgres'
import fastifyCors from 'fastify-cors'
import jwt from 'fastify-jwt'

import userRouters from './routers/user'
import config from './config'
const buildApp = (opt: FastifyServerOptions) => {
   const app = fastify(opt)
   const {user, password, host, database} = config.database
   const {secretkey} = config.server

   app.register(fastifyPostgres, {
      connectionString: `postgres://${user}:${password}@${host}/${database}`
   })
   app.register(fastifyCors)
   app.register(jwt, {
      secret: secretkey
    })

   app.register(userRouters, {
      prefix: '/user'
   })

   app.setErrorHandler((err, req, reply) => {
      reply
         .status(500)
         .send({
            error: {
               message: err.message,
               code: err.code
            }
         })
   })
   return app
}

export default buildApp