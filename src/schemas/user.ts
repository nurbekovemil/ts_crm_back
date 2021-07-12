
export const userBodyRequestLoginSchema = {
   body: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
         username: {
            type: 'string'
         },
         password: {
            type: 'string'
         }
      },
      additionalProperties: false
   },
   response: {
      200: {
         type: 'object',
         properties: {
            username: {
               type: 'string',
            },
            token: {
               type: 'string'
            }
         }
      }
   }
}

export const userGetAllListSchema = {
   query:{
      type: 'object',
      preoperties: {
         limit: {
            type: 'number'
         },
         page: {
            type: 'number'
         }
      }
   },
   response: {
      200: {
         type: 'array',
         properties: {
            id: {
               type: 'number'
            },
            username: {
               type: 'string'
            },
         },
         additionalProperties: false
      }
   }
}

export const userBodyRequestSchema = {
   body: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
         username: {
            type: 'string'
         },
         password: {
            type: 'string'
         }
      }
   },
   response: {
      200: {
         type: 'object',
         properties: {
            message: {
               type: 'string'
            }
         }
      }
   }
}

export const userDeleteByIdSchema = {
   query: {
      type: 'string',
      preoperties: {
         id: {
            type: 'string'
         }
      }
   },
   response: {
      200: {
         type: 'object',
         properties: {
            message: {
               type: 'string'
            }
         }
      }
   }
}
