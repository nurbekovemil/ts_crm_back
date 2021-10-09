import { FastifyRequest} from "fastify"

export type createOrderReguest = FastifyRequest<{
   Body:{
      type: number 
      payment: number 
      delivery: number
      weight: number 
      category: number
      description: string
      title: string
      price: number 
      amount: number
      cost: number
   }
}>