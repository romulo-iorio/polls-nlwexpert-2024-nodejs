import type { FastifyInstance } from "fastify";

import { pollResults } from "./poll-results";

export const registerSocketRoutes = (app: FastifyInstance) => {
  app.register(pollResults);
};
