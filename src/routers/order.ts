import { FastifyInstance } from "fastify";

// user types
import { createOrderReguest } from "../types/order";

// user schemas
import { createOrderSchema } from "../schemas/order";

import { verifyUserAuth } from "../hooks/user-auth";

const orderRouters = async (app: FastifyInstance) => {
	// ******Order******

	app.post(
		"/private/",
		{ preHandler: [verifyUserAuth], schema: createOrderSchema },
		createOrder
	); // Order create
	app.get(
		"/private/id/:id",
		{ preHandler: [verifyUserAuth] },
		getOrderByIdPrivate
	); // Get order by id
	app.put("/private/:id", { preHandler: [verifyUserAuth] }, updateOrderById); // update order by id
	app.get(
		"/private/type/:type",
		{ preHandler: [verifyUserAuth] },
		getMyOrderList
	); // Get own orders by type
	app.get("/private/", { preHandler: [verifyUserAuth] }, getAllOrderList); // Get all order list
	app.get(
		"/private/templates/:id",
		{ preHandler: [verifyUserAuth] },
		getTemplates
	); // Get templates
	app.put(
		"/private/status/",
		{ preHandler: [verifyUserAuth] },
		updateOrderStatus
	);

	app.get("/public/type/:type", {}, getOrderListHomePage);
	app.get("/public/id/:id", {}, getOrderByIdPublic);
};

async function getOrderByIdPublic(req) {
	const { id } = req.params;
	return await this.orderHandlers.getOrderByIdPublic(id);
}

// ******Order handlers*******
async function createOrder(req: createOrderReguest) {
	const {type, payment, delivery, weight, category, description, title, price, amount, cost} = req.body
	return await this.orderHandlers.createOrder(type, payment, delivery, weight, category, description, title, price, amount, cost, req.user.id)
}
async function updateOrderById() {}
async function getMyOrderList(req) {
	const { type } = req.params;
	const { id } = req.user;
	return await this.orderHandlers.getMyOrderList(type, id);
}
async function getOrderByIdPrivate(req) {
	const order_id = req.params.id;
	const { id, role } = req.user;
	return await this.orderHandlers.getOrderByIdPrivate(id, order_id, role);
}
async function getAllOrderList(req) {
	const { id, role } = req.user;
	return await this.orderHandlers.getAllOrderList(role, id);
}
async function getTemplates(req) {
	const { id } = req.params;
	return await this.orderHandlers.getTemplates(id);
}
async function updateOrderStatus(req) {
	try {
		const { order_id, status } = req.body;
		return await this.orderHandlers.updateOrderStatus(order_id, status);
	} catch (error) {
		return error;
	}
}

async function getOrderListHomePage(req) {
	const { type } = req.params;
	return await this.orderHandlers.getOrderListHomePage(type);
}

export default orderRouters;
