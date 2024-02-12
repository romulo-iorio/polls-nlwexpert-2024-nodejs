import fastify from "fastify";
import fastifyCookie from "@fastify/cookie";

import { registerRoutes } from "./routes";

const app = fastify();

app.register(fastifyCookie, { secret: "polls-app-nlw", hook: "onRequest" });

registerRoutes(app);

app.listen({ port: 3333 }).then(() => {
  console.log("Server is running on port 3333");
});
