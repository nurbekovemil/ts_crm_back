import fastify, {FastifyServerOptions} from 'fastify'
import fastifyPostgres from 'fastify-postgres'
import fastifyCors from 'fastify-cors'
import jwt from 'fastify-jwt'
import fp from 'fastify-plugin'
import multer from 'fastify-multer'
import fastifyStatic from 'fastify-static'
import path from 'path'
import config from './config'

// user modules
import userRouters from './routers/user'
import UserHandlers from './handlers/user'

// order modules
import orderRouters from './routers/order'
import OrderHandlers from './handlers/order'

// deal modules
import dealRouters from './routers/deal'
import DealHandlers from './handlers/deal'


const appInstance = (app, opt, done) => {
   const storage = multer.diskStorage({
      destination:  (req, file, cb) => {
        cb(null, `static/${file.fieldname}`)
      },
      filename:  (req, file, cb) => {
         const fx = file.originalname.split('.').pop()
        cb(null, `${file.fieldname}-${Date.now()}.${fx}`)
      }
    })
   app.decorate('upload', multer({ 
      storage: storage,
      fileFilter: (req, file, cb) => {
         if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
           cb(null, true);
         } else {
           cb(null, false);
         cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
         }
      }
   }))
   app.decorate('userHandlers', new UserHandlers(app.pg, app.jwt))
   app.decorate('orderHandlers', new OrderHandlers(app.pg, app.jwt))
   app.decorate('dealHandlers', new DealHandlers(app.pg, app.jwt))
   done()
}

const buildApp = (opt: FastifyServerOptions) => {
   const app = fastify(opt)

   const {user, password, host, database} = config.database
   const {secretkey} = config.server
   app.register(multer.contentParser)
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
   app.register(fp(appInstance))

   app.register(userRouters, {
      prefix: '/users'
   })
   app.register(orderRouters, {
      prefix: '/orders'
   })
   app.register(dealRouters, {
      prefix: '/deals'
   })

   app.register(fastifyStatic, {
      root: path.join(__dirname,'..', 'static'),
      prefix: '/static/',
      index: false,
   })
   
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