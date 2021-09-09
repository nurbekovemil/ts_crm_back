import { FastifyInstance } from "fastify"

// user types
import {
    orderBodyReguest
} from '../types/order'

// user schemas
import {
    orderCreateSchema
} from '../schemas/order'

import { 
    verifyUserAuth 
 } from "../hooks/user-auth"

const orderRouters = async (app: FastifyInstance) =>{
    app.post('/', {
        preHandler: [verifyUserAuth],
        schema: orderCreateSchema
    }, createOrder)

    app.put('/:id', {

    }, updateOrder)

    app.get('/:type', {
        preHandler: [verifyUserAuth],
    }, getAllOrderList)

    app.get('/by/:id', {
        preHandler: [verifyUserAuth],
    }, getOrderById)
}

async function createOrder(req: orderBodyReguest) {
    const {
        order_type,
        title,
        price,
        amount,
        cost, 
    } = req.body
    return await this.orderHandlers.createOrder(order_type, title, price, amount, cost, req.user.id)
}

async function updateOrder() {
    
}

async function getAllOrderList(req) {
    const {type} = req.params
    const {id} = req.user
    return await this.orderHandlers.getAllOrderList(type, id)
}

async function getOrderById(req) {
    const order_id = req.params.id
    const user_id = req.user.id
    return await this.orderHandlers.getOrderById(user_id, order_id)
}

export default orderRouters