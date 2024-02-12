import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../../lib/prisma";

export const createPoll = async (app: FastifyInstance) => {
  app.post("/polls", async (request, reply) => {
    const createPollBody = z.object({
      title: z.string(),
    });

    const { title } = createPollBody.parse(request.body);

    const poll = await prisma.poll.create({ data: { title } });

    return reply.status(201).send(poll);
  });
};
