type SubscriberMessage = {
  pollOptionId: string;
  pollId: string;
  votes: number;
};
type Subscriber = (message: SubscriberMessage) => void;

type Channel = Record<string, Subscriber[]>;

export class VotingPublisherSubscriber {
  private channels: Channel = {};

  subscribe(pollId: string, subscriber: Subscriber) {
    if (!this.channels[pollId]) this.channels[pollId] = [];

    this.channels[pollId].push(subscriber);
  }

  publish(pollId: string, message: SubscriberMessage) {
    if (!this.channels[pollId]) return;

    this.channels[pollId].forEach((subscriber) => subscriber(message));
  }
}
