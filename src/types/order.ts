import { FastifyRequest} from "fastify"

export type orderBodyReguest = FastifyRequest<{
   Body:{
      order_type: number
      title: string
      price: number
      amount: number
      cost: number
   }
}>