import { FastifyRequest} from "fastify";

export type userBodyReguest = FastifyRequest<{
   Body:{
      id?: number
      username: string
      password: string
   }
}>

export interface userGetAllListQuery {
   limit: number
   page: number
}

export interface userGetAllListResponse {
   id: number
   username: string
} 

export interface userLoginResponse {
   username: string
   token: string
}


export interface userMessageResponse {
   message: string
}

export interface userQueryById {
   id: string
}