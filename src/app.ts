import fastify, {FastifyServerOptions} from 'fastify'
import fastifyPostgres from 'fastify-postgres'
import fastifyCors from 'fastify-cors'
import jwt from 'fastify-jwt'
import fp from 'fastify-plugin'
import config from './config'

// user modules
import userRouters from './routers/user'
import UserHandlers from './handlers/user'

// oder modules
import orderRouters from './routers/order'
import OrderHandlers from './handlers/order'


const appInstance = (app, opt, done) => {
   app.decorate('userHandlers', new UserHandlers(app.pg, app.jwt))
   app.decorate('orderHandlers', new OrderHandlers(app.pg, app.jwt))
   done()
}

const buildApp = (opt: FastifyServerOptions) => {
   const app = fastify(opt)
   const {user, password, host, database} = config.database
   const {secretkey} = config.server


   app.register(fastifyPostgres, {
      connectionString: `postgres://${user}:${password}@${host}/${database}`
   })
   app.register(fastifyCors)
   app.register(jwt, {
      secret: secretkey,
      sign: {
         expiresIn: '4h'
       },
   })
   app.register(userRouters, {
      prefix: '/users'
   })
   app.register(orderRouters, {
      prefix: '/orders'
   })

   app.register(fp(appInstance))
   
   module.exports[Symbol.for('plugin-meta')] = {
      decorators: {
          fastify: [
              'userHandlers',
              'jwt'
          ]
      }
   }
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