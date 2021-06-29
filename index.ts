import { FastifyServerOptions } from "fastify";
import buildApp from "./src/app";
import config from "./src/config";


const options: FastifyServerOptions = {
   logger: true
}

const {port} = config.server

const app = buildApp(options)

app.listen(port)