import { verifyUserAuth } from "../hooks/user-auth";

const tenderRouters = async (app) => {
  app.post(
    "/",
    {
      preHandler: [verifyUserAuth, app.onlyDocs.array("tenders", 3)],
    },
    createTender
  );
  app.get(
    "/",
    {
      preHandler: [verifyUserAuth],
    },
    getTenderList
  );
  app.get(
    "/:id",
    {
      preHandler: [verifyUserAuth],
    },
    getTenderById
  );
  app.get("/all", {}, getTenderAllList);
};

async function createTender(req) {
  return this.tenderHandlers.createTender(req.body, req.files, req.user);
}

async function getTenderList(req) {
  return this.tenderHandlers.getTenderList(req.user);
}

async function getTenderById(req) {
  return this.tenderHandlers.getTenderById(req.params);
}

async function getTenderAllList(req) {
  return this.tenderHandlers.getTenderAllList();
}
export default tenderRouters;
