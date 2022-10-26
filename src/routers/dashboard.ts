import { FastifyInstance } from "fastify";

import { verifyUserAuth } from "../hooks/user-auth";

const dashboardRouters = async (app: FastifyInstance) => {
  app.get("/rows/:table", { preHandler: [verifyUserAuth] }, getTableRows);
  app.get("/offers", { preHandler: [verifyUserAuth] }, getInProcessingOffers);
};

async function getTableRows(req) {
  const { table } = req.params;
  return await this.dashboardHandlers.getTableRowCounts(table);
}

async function getInProcessingOffers(req) {
  return await this.dashboardHandlers.getInProcessingOffers(req.user);
}
export default dashboardRouters;
