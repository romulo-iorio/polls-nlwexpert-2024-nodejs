import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../../lib/prisma";

export const getPoll = async (app: FastifyInstance) => {
  app.get("/polls/:pollId", async (request, reply) => {
    const getPollParams = z.object({ pollId: z.string().uuid() });

    const { pollId } = getPollParams.parse(request.params);

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          select: { id: true, title: true },
        },
      },
    });

    return reply.status(200).send(poll);
  });
};
