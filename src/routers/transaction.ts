import { verifyUserAuth } from "../hooks/user-auth";

const transactionRouters = async (app) => {
  app.get("/", { preHandler: [verifyUserAuth] }, getAllTransactionList);
  app.get("/:id", { preHandler: [verifyUserAuth] }, getTransactionById);
  app.post("/", { preHandler: [verifyUserAuth] }, createTransaction);
  app.put("/", { preHandler: [verifyUserAuth] }, updateTransactionStatus);
  app.get("/accounts", { preHandler: [verifyUserAuth] }, getUserAccounts);
};

async function createTransaction(req) {
  const { user_id, transaction_type, amount } = req.body;
  const { id } = req.user;
  return await this.transactionHandlers.createTransaction({
    transaction_type,
    user_from: id,
    user_to: user_id,
    amount,
    status: 1,
  });
}

async function getUserAccounts(req) {
  return await this.transactionHandlers.getUserAccounts();
}

async function getAllTransactionList(req) {
  return await this.transactionHandlers.getAllTransactionList(
    req.user,
    req.query
  );
}

async function updateTransactionStatus(req) {
  return await this.transactionHandlers.updateTransactionStatus(
    req.body,
    req.user
  );
}

async function getTransactionById(req) {
  return await this.transactionHandlers.getTransactionById(req.params);
}

export default transactionRouters;
