import { FastifyRequest } from "fastify";
import fastifyJwt, { FastifyJWTOptions } from "fastify-jwt";

export type userBodyReguest = FastifyRequest<{
  Body: {
    id?: number;
    username: string;
    password?: string;
    type: number;
    role: number;
  };
}>;

export type userUpdateReguest = FastifyRequest<{
  Body: {
    id?: number;
    username: string;
    password?: string;
  };
}>;

export interface userGetAllListResponse {
  id: number;
  username: string;
  orders: number;
  role: string;
}

export interface userLoginResponse {
  user: {};
  menus: [];
  token: string;
}

export interface userMessageResponse {
  message: string;
}

export interface userGetMe {
  user: {};
  menus: any[];
}

declare module "fastify-jwt" {
  interface FastifyJWT {
    payload: {
      id: number;
    };
  }
}
