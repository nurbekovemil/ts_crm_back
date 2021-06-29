import * as dotenv from 'dotenv'
dotenv.config()

const config = {
   server: {
      port: process.env.SERVER_PORT || 3000,
      secretkey: process.env.SECRET_KEY
   },
   database: {
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT)
   }
}

export default config