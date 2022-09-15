import { verifyUserAuth } from "../hooks/user-auth";

const transactionRouters = async (app) => {
  app.post("/", { preHandler: [verifyUserAuth] }, createTransaction);
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

export default transactionRouters;
