import { FastifyInstance } from "fastify";

import { verifyUserAuth } from "../hooks/user-auth";

const catalogRouters = async (app: FastifyInstance) => {
  app.get("/", getTnvedCategories);
  app.get("/categories", getCategories);
  app.get("/categories/:id", getCategoryOrders);
  app.post("/latestorders", latestorders);
  app.get("/order_tnved", getOrderTnved);
  app.get("/table", getCatalogByTable);
  app.put("/table", updateCatalogItem);
  app.post("/table", createCatalogItem);
  app.delete("/table", deleteCatalogItem);
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

async function getOrderTnved(req) {
  return await this.catalogHandlers.getOrderTnved(req.query);
}

async function getCatalogByTable(req) {
  return await this.catalogHandlers.getCatalogByTable(req.query);
}

async function updateCatalogItem(req) {
  return await this.catalogHandlers.updateCatalogItem(req.body);
}

async function createCatalogItem(req) {
  return await this.catalogHandlers.createCatalogItem(req.body);
}

async function deleteCatalogItem(req) {
  return await this.catalogHandlers.deleteCatalogItem(req.body);
}

export default catalogRouters;
