import fastify, { FastifyServerOptions } from "fastify";
import fastifyPostgres from "fastify-postgres";
import fastifyCors from "fastify-cors";
import jwt from "fastify-jwt";
import fp from "fastify-plugin";
import multer from "fastify-multer";
import fastifyStatic from "fastify-static";
import path from "path";
import config from "./config";

// user modules
import userRouters from "./routers/user";
import UserHandlers from "./handlers/user";

// order modules
import orderRouters from "./routers/order";
import OrderHandlers from "./handlers/order";

// deal modules
import dealRouters from "./routers/deal";
import DealHandlers from "./handlers/deal";

// catalog modules

import catalogRouters from "./routers/catalog";
import CatalogHandlers from "./handlers/catalog";

// dashboard modules

import dashboardRouters from "./routers/dashboard";
import DashboardHandlers from "./handlers/dashboard";

// report modules

import reportRouters from "./routers/report";
import ReportHandlers from "./handlers/report";

// transaction modules

import transactionRouters from "./routers/transaction";
import TransactionHandlers from "./handlers/transaction";

const appInstance = (app, opt, done) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `static/${file.fieldname}`);
    },
    filename: (req, file, cb) => {
      const fx = file.originalname.split(".").pop();
      cb(null, `${file.fieldname}-${Date.now()}.${fx}`);
    },
  });
  // order create decorate
  app.decorate(
    "upload",
    multer({
      storage: storage,
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype == "application/msword" ||
          file.mimetype ==
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.mimetype == "image/png" ||
          file.mimetype == "image/jpg" ||
          file.mimetype == "image/jpeg" ||
          file.mimetype == "application/pdf"
        ) {
          cb(null, true);
        } else {
          cb(null, false);
          cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
        }
      },
    })
  );
  // deal with comment
  app.decorate(
    "dealComment",
    multer({
      storage: storage,
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype == "application/msword" ||
          file.mimetype ==
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.mimetype == "image/jpeg" ||
          file.mimetype == "image/jpg" ||
          file.mimetype == "image/png" ||
          file.mimetype == "application/pdf"
        ) {
          cb(null, true);
        } else {
          cb(null, false);
          cb(
            new Error(
              "Only .png, .jpg, .jpeg, .doc, .docx, .pdf format allowed!"
            )
          );
        }
      },
    })
  );
  app.decorate("userHandlers", new UserHandlers(app.pg, app.jwt));
  app.decorate("orderHandlers", new OrderHandlers(app.pg, app.jwt));
  app.decorate("dealHandlers", new DealHandlers(app.pg, app.jwt));
  app.decorate("catalogHandlers", new CatalogHandlers(app.pg));
  app.decorate("dashboardHandlers", new DashboardHandlers(app.pg));
  app.decorate("reportHandlers", new ReportHandlers(app.pg));
  app.decorate("transactionHandlers", new TransactionHandlers(app.pg));
  done();
};

const buildApp = (opt: FastifyServerOptions) => {
  const app = fastify(opt);

  const { user, password, host, database } = config.database;
  const { secretkey } = config.server;

  app.register(multer.contentParser);
  app.register(fastifyPostgres, {
    connectionString: `postgres://${user}:${password}@${host}/${database}`,
  });
  app.register(fastifyCors, {
    origin: "http://ts.kse.kg",
    // origin: "http://localhost:8080",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: false,
    exposedHeaders: null,
    allowedHeaders: null,
    maxAge: null,
    preflight: true,
    strictPreflight: true,
  });
  app.register(jwt, {
    secret: secretkey,
    sign: {
      expiresIn: "4h",
    },
    messages: {
      badRequestErrorMessage: "Формат: Authorization Bearer [токен]",
      noAuthorizationInHeaderMessage: "Заголовок авторизации отсутствует!",
      authorizationTokenExpiredMessage:
        "Ваша сессия истека, повторите попытку авторизации",
      authorizationTokenInvalid: (err) => {
        return `Токен авторизации недействителен: ${err.message}`;
      },
    },
  });
  app.register(fp(appInstance));

  app.register(userRouters, {
    prefix: "/users",
  });
  app.register(orderRouters, {
    prefix: "/orders",
  });
  app.register(dealRouters, {
    prefix: "/deals",
  });

  app.register(catalogRouters, {
    prefix: "/catalog",
  });

  app.register(dashboardRouters, {
    prefix: "/dashboard",
  });

  app.register(reportRouters, {
    prefix: "/reports",
  });

  app.register(transactionRouters, {
    prefix: "/transfers",
  });

  app.register(fastifyStatic, {
    root: path.join(__dirname, "..", "static"),
    prefix: "/static/",
    index: false,
  });
  module.exports[Symbol.for("plugin-meta")] = {
    decorators: {
      fastify: ["userHandlers", "jwt"],
    },
  };
  app.setErrorHandler((err, req, reply) => {
    reply.status(500).send({
      error: {
        message: err.message,
        code: err.code,
      },
    });
  });
  return app;
};

export default buildApp;
