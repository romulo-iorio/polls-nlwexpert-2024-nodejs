import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../../lib/prisma";
import { redis } from "../../lib";

type Vote = Record<string, number>;

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

    if (!poll) return reply.status(404).send({ message: "Poll not found" });

    const pollVotes = await redis.zrange(`poll:${pollId}`, 0, -1, "WITHSCORES");

    const votes = pollVotes.reduce((vote, line, i) => {
      const isIndexEven = i % 2 === 0;
      if (!isIndexEven) return vote;

      const optionId = line;
      const score = pollVotes[i + 1];

      return { ...vote, [optionId]: Number(score) };
    }, {} as Vote);

    const pollOptions = poll.options.map((option) => ({
      ...option,
      votes: votes[option.id] || 0,
    }));

    const response = { ...poll, options: pollOptions };

    return reply.status(200).send(response);
  });
};
