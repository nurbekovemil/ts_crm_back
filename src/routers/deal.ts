import { FastifyInstance } from "fastify"

import { 
    verifyUserAuth
 } from "../hooks/user-auth"

const dealRouters = async (app: FastifyInstance) =>{

    // ******Deals******
    app.post('/', {preHandler: [verifyUserAuth]}, createDeal) // Create deal

    app.get('/', {preHandler: [verifyUserAuth]}, getDeals) // Get all deals by status
    
    app.get('/:id', {preHandler:[verifyUserAuth]}, getDealById) // Get deal by id

    app.get('/order/', {preHandler:[verifyUserAuth]}, getDealOrders) // Get orders of deals
    
    app.put('/', {preHandler: [verifyUserAuth]}, updateDealStatus) //  update deal status
}

// ******deal handlers******
async function createDeal(req) {
    const {
        user_to,
        order_from,
        order_to
    } = req.body
    const {id} = req.user
    return await this.dealHandlers.createDeal(id, user_to, order_from, order_to)
}
async function getDeals(req) {
    const {id} = req.user
    const {status} = req.query
    return await this.dealHandlers.getDeals(id, status)
}



async function getDealById(req) {
    const deal_id = req.params.id
    const user_id = req.user.id
    return await this.dealHandlers.getDealById(deal_id, user_id)
}

async function getDealOrders(req) {
    const {order_from, order_to} = req.query
    const user_id = req.user.id
    return await this.dealHandlers.getDealOrders(order_from, order_to, user_id)
}

async function updateDealStatus(req) {
    const {
        status, 
        deal_id
    } = req.body
    return await this.dealHandlers.updateDealStatus(status, deal_id)
}

export default dealRouters