import type { FastifyInstance } from "fastify";

import { voteOnPoll } from "./vote-on-poll";
import { createPoll } from "./create-poll";
import { getPoll } from "./get-poll";

export const registerRoutes = (app: FastifyInstance) => {
  app.register(voteOnPoll);
  app.register(createPoll);
  app.register(getPoll);
};
