import { verifyUserAuth } from "../hooks/user-auth";

const dealRouters = async (app) => {
  app.post("/deals", { preHandler: [verifyUserAuth] }, getDealReports);
};

async function getDealReports(req) {
  return await this.reportHandlers.getDealReports(req.body);
}

export default dealRouters;
