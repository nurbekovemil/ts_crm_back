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
declare module 'fastify' {
   interface FastifyRequest {
     file: createOrderFile
     files: FilesInRequest
   }
}

export type FilesObject = {
   [fieldname: string]: Partial<File>[]
}
type FilesInRequest = FilesObject | Partial<File>[]

export interface createOrderFile {
   /** Field name specified in the form */
   fieldname: string
   /** Name of the file on the user's computer */
   originalname: string
   /** Encoding type of the file */
   encoding: string
   /** Mime type of the file */
   mimetype: string
   /** Size of the file in bytes */
   size?: number
   /** The folder to which the file has been saved (DiskStorage) */
   destination?: string
   /** The name of the file within the destination (DiskStorage) */
   filename?: string
   /** Location of the uploaded file (DiskStorage) */
   path?: string
   /** A Buffer of the entire file (MemoryStorage) */
   buffer?: Buffer
   stream?: NodeJS.ReadableStream
 }