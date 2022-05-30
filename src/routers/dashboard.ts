import { FastifyInstance } from "fastify";

import { verifyUserAuth } from "../hooks/user-auth";

const dashboardRouters = async (app: FastifyInstance) => {
  app.get("/rows/:table", getTableRows);
};

async function getTableRows(req) {
  const { table } = req.params;
  const rows = await this.dashboardHandlers.getTableRowCounts(table);
  return rows;
}
export default dashboardRouters;
