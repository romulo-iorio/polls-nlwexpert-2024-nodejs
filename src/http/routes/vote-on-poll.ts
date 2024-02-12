import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "crypto";
import { z } from "zod";

import { prisma, redis } from "../../lib";
import { votingPublisherSubscriber } from "../../utils/voting-publisher-subscriber";

const ONE_MONTH_IN_SECONDS = 60 * 60 * 24 * 30;

const cookieSettings = {
  maxAge: ONE_MONTH_IN_SECONDS,
  httpOnly: true,
  signed: true,
  path: "/",
};

const getOrCreateSessionId = (sessionId?: string) => {
  if (sessionId) return sessionId;

  return randomUUID();
};

export const voteOnPoll = async (app: FastifyInstance) => {
  app.post("/polls/:pollId/votes", async (request, reply) => {
    const voteOnPollBody = z.object({ pollOptionId: z.string().uuid() });
    const voteOnPollParams = z.object({ pollId: z.string().uuid() });

    const { pollOptionId } = voteOnPollBody.parse(request.body);
    const { pollId } = voteOnPollParams.parse(request.params);

    const sessionId = getOrCreateSessionId(request.cookies.sessionId);

    const userPreviousVoteOnPoll = await prisma.vote.findUnique({
      where: { sessionId_pollId: { pollId, sessionId } },
    });

    const userAlreadyVotedOnPollWithThisOption =
      userPreviousVoteOnPoll &&
      userPreviousVoteOnPoll.pollOptionId === pollOptionId;
    if (userAlreadyVotedOnPollWithThisOption)
      return reply
        .status(400)
        .send({ error: "User has already voted on this poll" });

    if (userPreviousVoteOnPoll) {
      const { pollOptionId: previousPollOptionId, id } = userPreviousVoteOnPoll;

      await prisma.vote.delete({ where: { id } });
      const previousOptionVotes = await redis.zincrby(
        `poll:${pollId}`,
        -1,
        `option:${previousPollOptionId}`
      );
      votingPublisherSubscriber.publish(pollId, {
        votes: Number(previousOptionVotes),
        pollOptionId: previousPollOptionId,
        pollId,
      });
    }

    reply.setCookie("sessionId", sessionId, cookieSettings);

    await prisma.vote.create({ data: { pollOptionId, sessionId, pollId } });

    const votes = await redis.zincrby(
      `poll:${pollId}`,
      1,
      `option:${pollOptionId}`
    );

    votingPublisherSubscriber.publish(pollId, {
      votes: Number(votes),
      pollOptionId,
      pollId,
    });

    return reply.status(201).send();
  });
};
