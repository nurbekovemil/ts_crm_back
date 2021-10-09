import { FastifyInstance } from "fastify"

import { 
    verifyUserAuth
 } from "../hooks/user-auth"

const dealRouters = async (app: FastifyInstance) =>{

    // ******Deals******
    app.post('/', {preHandler: [verifyUserAuth]}, createDeal) // Create deal

    app.get('/:status', {preHandler: [verifyUserAuth]}, getDeals) // Get all deals by status
    
    app.get('/by/:id', {preHandler:[verifyUserAuth]}, getDealById) // Get deal by id
    
    app.put('/', {preHandler: [verifyUserAuth]}, updateDealStatus) //  update deal status

    // app.get('/deals', {preHandler: [verifyUserAuth]}, getMyDeals)
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
    const {status} = req.params
    return await this.dealHandlers.getDeals(id, status)
}



async function getDealById(req) {
    const deal_id = req.params.id
    const user_id = req.user.id
    return await this.dealHandlers.getDealById(deal_id, user_id)
}

async function updateDealStatus(req) {
    const {
        status, 
        deal_id
    } = req.body
    return await this.dealHandlers.updateDealStatus(status, deal_id)
}







export default dealRouters