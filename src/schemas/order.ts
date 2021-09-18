export const orderCreateSchema = {
    body: {
        type: 'object',
        required: [
            'order_type', 
            'title',
            'price', 
            'amount',
            'cost', 
        ],
        properties: {
            order_type: {
                type: 'number'
            },
            title: {
                type: 'string'
            },
            price: {
                type: 'number'
            },
            amount: {
                type: 'number'
            },
            cost: {
                type: 'number'
            },
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