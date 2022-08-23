import { FastifyInstance } from "fastify";

import { verifyUserAuth } from "../hooks/user-auth";

const dealRouters = async (app) => {
  // ******Deals******
  app.post("/", { preHandler: [verifyUserAuth] }, createDeal); // Create deal

  app.get("/", { preHandler: [verifyUserAuth] }, getDeals); // Get all deals by status

  app.get("/:id", { preHandler: [verifyUserAuth] }, getDealById); // Get deal by id

  app.get("/order/:id", { preHandler: [verifyUserAuth] }, getDealOrders); // Get orders of deals

  app.put("/", { preHandler: [verifyUserAuth] }, updateDealStatus); //  update deal by status
  app.put(
    "/comment",
    {
      preHandler: [verifyUserAuth, app.dealComment.array("dealFiles", 16)],
    },
    updateDealWithComment
  ); //  update deal by status

  app.get("/history/", {}, getOfferHistory);

  app.get("/trade-list/:date", {}, getTrageList);
  app.get("/trade/:id", {}, getTradeById);

  app.get("/depo-deals/:date", { preHandler: [verifyUserAuth] }, getDepoDeals);

  app.delete("/:id", { preHandler: [verifyUserAuth] }, deleteOfferById);
};

// ******deal handlers******
async function createDeal(req) {
  const { user_to, order_from, order_to } = req.body;
  const { id } = req.user;
  return await this.dealHandlers.createDeal(id, user_to, order_from, order_to);
}
async function getDeals(req) {
  const { id } = req.user;
  const { status } = req.query;
  return await this.dealHandlers.getDeals(id, status);
}

async function getDealById(req) {
  const deal_id = req.params.id;
  const user_id = req.user.id;
  return await this.dealHandlers.getDealById(deal_id, user_id);
}

async function getDealOrders(req) {
  const deal_id = req.params.id;
  const user_id = req.user.id;
  return await this.dealHandlers.getDealOrders(deal_id, user_id);
}

async function updateDealStatus(req) {
  const { status, deal_id } = req.body;
  return await this.dealHandlers.updateDealStatus(status, deal_id);
}

async function updateDealWithComment(req) {
  return await this.dealHandlers.updateDealWithComment(
    req.body,
    req.files,
    req.user.id
  );
}

async function getOfferHistory(req) {
  return await this.dealHandlers.getOfferHistory(req.query);
}

async function deleteOfferById(req) {
  return await this.dealHandlers.deleteOffer(req.params);
}

async function getTrageList(req) {
  return await this.dealHandlers.getTrageList(req.params);
}

async function getTradeById(req) {
  return await this.dealHandlers.getTradeById(req.params);
}

async function getDepoDeals(req) {
  return await this.dealHandlers.getDepoDeals(req.params);
}
export default dealRouters;
