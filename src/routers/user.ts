import { FastifyInstance } from "fastify";
import * as bcrypt from "bcrypt";

// user types
import {
  userGetAllListResponse,
  userBodyReguest,
  userUpdateReguest,
  userLoginResponse,
  userMessageResponse,
  userGetMe,
} from "../types/user";

// user schemas
import {
  userBodyRequestLoginSchema,
  userBodyRequestUpdateSchema,
  userBodyReguestCreateSchema,
  userGetAllListSchema,
} from "../schemas/user";

import { verifyUserAuth } from "../hooks/user-auth";

const userRouters = async (app: FastifyInstance) => {
  app.post("/login", { schema: userBodyRequestLoginSchema }, userLogin);

  app.post(
    "/",
    { preHandler: [verifyUserAuth], schema: userBodyReguestCreateSchema },
    userCreate
  );
  app.post("/publuc/registration/", {}, userRegistration);

  app.get(
    "/",
    { preHandler: [verifyUserAuth], schema: userGetAllListSchema },
    userGetAllList
  );

  app.get(
    "/me",
    {
      preHandler: [verifyUserAuth],
    },
    userGetMeH
  );
  app.get("/:id", { preHandler: [verifyUserAuth] }, getUserById);
  app.get("/profile", { preHandler: [verifyUserAuth] }, getProfile);
  app.put(
    "/",
    {
      preHandler: [verifyUserAuth],
      schema: userBodyRequestUpdateSchema,
    },
    userUpdate
  );

  app.put("/status", updateUserStatus);

  app.delete(
    "/:id",
    {
      preHandler: [verifyUserAuth],
    },
    userDelete
  );

  app.get("/template", {}, gerUserRegisterTemplate);
};
//////Для ревью

async function userLogin(req: userBodyReguest): Promise<userLoginResponse> {
  const { username, password } = req.body;
  return await this.userHandlers.userLogin(username, password);
}

async function userCreate(req: userBodyReguest): Promise<userMessageResponse> {
  const { username, password, user_type, data } = req.body;
  return await this.userHandlers.userCreate(
    username,
    password,
    user_type,
    data
  );
}

async function userRegistration(req) {
  return await this.userHandlers.userRegistration(req.body);
}

async function userGetMeH(req): Promise<userGetMe> {
  const { id } = req.user;
  return await this.userHandlers.userGetMe(id);
}
async function getUserById(req) {
  const user_id = req.params.id;
  const me_id = req.user.id;
  return await this.userHandlers.getUserById(user_id, me_id);
}

async function updateUserStatus(req) {
  const { status, user_id } = req.query;
  return await this.userHandlers.updateUserStatus(status, user_id);
}

async function userUpdate(
  req: userUpdateReguest
): Promise<userMessageResponse> {
  const { id, username, password } = req.body;
  return await this.userHandlers.userUpdate(id, username, password);
}

async function userDelete(req): Promise<userMessageResponse> {
  const { id } = req.params;
  return await this.userHandlers.userDelete(id);
}

async function userGetAllList(req): Promise<Array<userGetAllListResponse>> {
  let { limit, page } = req.query;
  let offset: number = page * limit - limit;
  return await this.userHandlers.userGetAllList(limit, offset, req.user.id);
}

async function gerUserRegisterTemplate(req) {
  const { type } = req.query;
  return await this.userHandlers.gerUserRegisterTemplate(type);
}

async function getProfile(req) {
  const { id } = req.user;
  return await this.userHandlers.getUserById(id, id);
}

export default userRouters;
