import fastifyWebsocket from "@fastify/websocket";
import fastifyCookie from "@fastify/cookie";
import fastify from "fastify";

import { registerSocketRoutes } from "./ws";
import { registerRoutes } from "./routes";

const app = fastify();

app.register(fastifyCookie, { secret: "polls-app-nlw", hook: "onRequest" });
app.register(fastifyWebsocket);

registerSocketRoutes(app);
registerRoutes(app);

app.listen({ port: 3333 }).then(() => {
  console.log("Server is running on port 3333");
});
