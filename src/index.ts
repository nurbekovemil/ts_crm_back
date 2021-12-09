import { FastifyServerOptions } from "fastify";
import buildApp from "./app";
import config from "./config";


const options: FastifyServerOptions = {
   logger: true
}

const {port} = config.server

const app = buildApp(options)

app.listen(port)