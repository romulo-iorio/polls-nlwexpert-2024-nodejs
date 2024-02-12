import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { votingPublisherSubscriber } from "../../utils/voting-publisher-subscriber";

export const pollResults = async (app: FastifyInstance) => {
  app.get(
    "/polls/:pollId/results",
    { websocket: true },
    async (connection, request) => {
      const getPollParams = z.object({ pollId: z.string().uuid() });
      const { pollId } = getPollParams.parse(request.params);

      votingPublisherSubscriber.subscribe(pollId, (message) => {
        connection.socket.send(JSON.stringify(message));
      });
    }
  );
};
