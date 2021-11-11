
// user types
import { createOrderReguest, createOrderFile } from "../types/order";

// user schemas
import { createOrderSchema } from "../schemas/order";

import { verifyUserAuth } from "../hooks/user-auth";


const orderRouters = async (app) => {

	app.post("/private/",{ 
		preHandler: [
			verifyUserAuth,
			app.upload.array('images', 15)

		], 
		// schema: createOrderSchema 
	},
		createOrder); // Order create
	
	app.put("/private/",{ preHandler: [verifyUserAuth] },updateOrderStatus);
	app.put("/private/:id", { preHandler: [verifyUserAuth] }, updateOrderById); // Update order by id

	app.get("/private/:id",{ preHandler: [verifyUserAuth] },getOrderByIdPrivate); // Get order by id
	app.get("/private/type/",{ preHandler: [verifyUserAuth] },getMyOrderList); // Get own orders by type
	app.get("/private/", { preHandler: [verifyUserAuth] }, getAllOrderList); // Get all order list
	app.get("/private/options/",{ preHandler: [verifyUserAuth] },getOptions); // Get all options
	
	app.get("/public/type/", {}, getOrderListHomePage); // get Order list for home page
	app.get("/public/:id", {}, getOrderByIdPublic);

	app.post('/file', {
		preHandler: [
			// verifyUserAuth,
			app.upload.array('images', 15)
		]
	}, 
		function(req){
		
		return {
			files: req.files,
			body: req.body
		}
	})
	
};

async function getOrderByIdPublic(req) {
	const { id } = req.params;
	return await this.orderHandlers.getOrderByIdPublic(id);
}

// ******Order handlers*******
async function createOrder(req: createOrderReguest, reply) {
	const id = await this.orderHandlers.createOrder(req.body, req.user, req.files)
	reply.send({
		id,
		message: 'Order successfully created!'
	})
}
async function updateOrderById() {}
async function getMyOrderList(req) {
	const { type } = req.query;
	const { id } = req.user;
	return await this.orderHandlers.getMyOrderList(type, id);
}
async function getOrderByIdPrivate(req, reply) {
	const order_id = req.params.id;
	const { id, role } = req.user;
	const order = await this.orderHandlers.getOrderByIdPrivate(id, order_id, role);
	if(!order.length) {
		return reply.code(404).send({message: 'Order is not found!'})
	}
	reply.send(order[0])
}
async function getAllOrderList(req) {
	const { id, role } = req.user;
	return await this.orderHandlers.getAllOrderList(role, id);
}
async function getOptions(req) {
	const {option} = req.query
	return await this.orderHandlers.getOptions(option);
}
async function updateOrderStatus(req) {
	try {
		const { order_id, status } = req.query;
		return await this.orderHandlers.updateOrderStatus(order_id, status);
	} catch (error) {
		return error;
	}
}

async function getOrderListHomePage(req) {
	const { type } = req.query;
	return await this.orderHandlers.getOrderListHomePage(type);
}

export default orderRouters;
