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
    verifyUserAuth,
    checkUserIsAdmin
 } from "../hooks/user-auth"

const orderRouters = async (app: FastifyInstance) =>{
    // Create order
    app.post('/', {
        preHandler: [verifyUserAuth],
        schema: orderCreateSchema
    }, createOrder)

    app.post('/offers', {
        preHandler: [verifyUserAuth],
    }, sendOfferOrder)

    app.get('/offers', {
        preHandler: [verifyUserAuth],
    }, getOffers)

    app.put('/:id', {

    }, updateOrder)

    // Get own orders by type 
    app.get('/:type', {
        preHandler: [verifyUserAuth],
    }, getMyOrderList)

    // Get order by id
    app.get('/by/:id', {
        preHandler: [verifyUserAuth],
    }, getOrderById)

    // Get all order list
    app.get('/', {
        preHandler: [verifyUserAuth],
    }, getAllOrderList)

    app.put('/status/', {
        preHandler: [verifyUserAuth]
    }, updateOrderStatus)
}

async function updateOrderStatus(req) {
    try {
        const {order_id, status} = req.body
        return await this.orderHandlers.updateOrderStatus(order_id, status)
    } catch (error) {
        return error
    }
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

async function sendOfferOrder(req) {
    const {
        user_to,
        order_from,
        order_to
    } = req.body
    const {id} = req.user
    return await this.orderHandlers.sendOfferOrder(id, user_to, order_from, order_to)
}

async function getOffers(req) {
    const {id} = req.user
    return await this.orderHandlers.getOffers(id)
}

async function updateOrder() {
    
}

async function getMyOrderList(req) {
    const {type} = req.params
    const {id} = req.user
    return await this.orderHandlers.getMyOrderList(type, id)
}

async function getOrderById(req) {
    const order_id = req.params.id
    const {id, role} = req.user
    return await this.orderHandlers.getOrderById(id, order_id, role)
}

async function getAllOrderList(req) {
    const {id, role} = req.user
    return await this.orderHandlers.getAllOrderList(role, id)
}

export default orderRouters