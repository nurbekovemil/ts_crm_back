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
    // ******Order******

    app.post('/', {preHandler: [verifyUserAuth],schema: orderCreateSchema}, createOrder) // Order create
    
    app.put('/:id', {}, updateOrderById) // update order by id
    
    app.get('/:type', {preHandler: [verifyUserAuth]}, getMyOrderList) // Get own orders by type 

    app.get('/by/:id', {preHandler: [verifyUserAuth]}, getOrderById) // Get order by id

    app.get('/', {preHandler: [verifyUserAuth]}, getAllOrderList) // Get all order list

    app.put('/status/', {preHandler: [verifyUserAuth]}, updateOrderStatus)

}

// ******Order handlers*******
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
async function updateOrderById() {
    
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
async function updateOrderStatus(req) {
    try {
        const {order_id, status} = req.body
        return await this.orderHandlers.updateOrderStatus(order_id, status)
    } catch (error) {
        return error
    }
}







export default orderRouters