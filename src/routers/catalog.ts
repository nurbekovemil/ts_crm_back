import { FastifyInstance } from "fastify";

import { verifyUserAuth } from "../hooks/user-auth";

const catalogRouters = async (app: FastifyInstance) => {
  app.get("/", getTnvedCategories);
  app.get("/categories", getCategories);
  app.get("/categories/:id", getCategoryOrders);
  app.post("/latestorders", latestorders);
};

async function getTnvedCategories(req) {
  const { page } = req.query;
  const tnved = await this.catalogHandlers.getTnvedCategories(page);
  return tnved;
}

async function getCategories(req) {
  return await this.catalogHandlers.getCategories();
}

async function getCategoryOrders(req) {
  return await this.catalogHandlers.getCategoryOrders(req.params);
}

async function latestorders(req) {
  return await this.catalogHandlers.latestorders(req.body);
}

export default catalogRouters;
