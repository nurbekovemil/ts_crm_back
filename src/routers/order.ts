// user types
import { createOrderReguest, createOrderFile } from "../types/order";

// user schemas
import { createOrderSchema } from "../schemas/order";

import { verifyUserAuth } from "../hooks/user-auth";

const orderRouters = async (app) => {
  app.post(
    "/private/",
    {
      preHandler: [verifyUserAuth, app.upload.array("images", 15)],
      // schema: createOrderSchema
    },
    createOrder
  ); // Order create

  app.put("/private/", { preHandler: [verifyUserAuth] }, updateOrderStatus);
  app.post(
    "/private/update",
    { preHandler: [verifyUserAuth] },
    updateOrderById
  ); // Update order by id

  app.get(
    "/private/:id",
    { preHandler: [verifyUserAuth] },
    getOrderByIdPrivate
  ); // Get order by id
  app.get("/private/type/", { preHandler: [verifyUserAuth] }, getMyOrderList); // Get own orders by type
  app.get("/private/", { preHandler: [verifyUserAuth] }, getAllOrderList); // Get all order list
  app.get("/private/options/", { preHandler: [verifyUserAuth] }, getOptions); // Get all options

  app.get("/public/type/", {}, getOrderListHomePage); // get Order list for home page
  app.get("/public/:id", {}, getOrderByIdPublic);

  app.post(
    "/file",
    {
      preHandler: [
        // verifyUserAuth,
        app.upload.array("images", 15),
      ],
    },
    function (req) {
      return {
        files: req.files,
        body: req.body,
      };
    }
  );
  app.put(
    "/private/image",
    { preHandler: [verifyUserAuth, app.upload.array("images", 1)] },
    uploadOrderImage
  );

  app.delete("/private/:id", { preHandler: [verifyUserAuth] }, deleteOrder);
  app.delete(
    "/private/image/:id",
    { preHandler: [verifyUserAuth] },
    deleteImage
  );
};

async function getOrderByIdPublic(req) {
  const { id } = req.params;
  return await this.orderHandlers.getOrderByIdPublic(id);
}

// ******Order handlers*******
async function createOrder(req: createOrderReguest, reply) {
  const rows = await this.orderHandlers.createOrder(req.body, req.user);
  if (req.files.length > 0) {
    await this.orderHandlers.createImage(req.files, rows.id);
  }
  if (rows) {
    reply.send({
      rows,
      message: "Заявка успешно создан!",
    });
  } else {
    reply.send({
      message: "Error!",
    });
  }
}
async function updateOrderById(req) {
  const { order, id } = req.body;
  return await this.orderHandlers.updateOrderById(order, id);
}
async function getMyOrderList(req) {
  let { type, page, limit } = req.query;
  limit = limit || 10;
  page = page || 1;
  let offset: number = page * limit - limit;
  const { id } = req.user;
  return await this.orderHandlers.getMyOrderList(type, limit, offset, id);
}
async function getOrderByIdPrivate(req, reply) {
  const order_id = req.params.id;
  const { id, role } = req.user;
  const order = await this.orderHandlers.getOrderByIdPrivate(
    id,
    order_id,
    role
  );
  reply.send(order[0]);
}
async function getAllOrderList(req) {
  const { id, role } = req.user;
  let { page, limit } = req.query;
  limit = limit || 10;
  page = page || 1;
  let offset: number = page * limit - limit;
  return await this.orderHandlers.getAllOrderList(role, id, limit, offset);
}
async function getOptions(req) {
  const { option } = req.query;
  return await this.orderHandlers.getOptions(option);
}
async function updateOrderStatus(req) {
  try {
    const { order_id, status } = req.query;
    const res = await this.orderHandlers.updateOrderStatus(order_id, status);
    return res;
  } catch (error) {
    return error;
  }
}

async function getOrderListHomePage(req) {
  const { type, limit } = req.query;
  let res = await this.orderHandlers.getOrderListHomePage(type, limit);
  return res;
}

async function deleteOrder(req) {
  const { id } = req.params;
  return await this.orderHandlers.deleteOrder(id);
}

async function uploadOrderImage(req) {
  await this.orderHandlers.createImage(req.files, req.body.order_id);
  return { message: "Изображение загружено!" };
}

async function deleteImage(req) {
  const { id } = req.params;
  return await this.orderHandlers.deleteImage(id);
}

export default orderRouters;
