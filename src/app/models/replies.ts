import { dateNow, FireConvertTo } from './firestore';
import { AuthorType } from './user';

export type VoteArrName = 'upvotes' | 'downvotes';
export interface VoteType {
  upvotes: Set<string>;
  downvotes: Set<string>;
}

export class Vote {
  public static empty = (): VoteType => {
    return {
      upvotes: new Set<string>(),
      downvotes: new Set<string>(),
    };
  };
  public static getBalance = (vote: VoteType): number => {
    return vote.upvotes.size - vote.downvotes.size;
  };
  public static toggleUpvote = (vote: VoteType, uid: string): boolean => {
    return Vote.toggleVote(uid, vote.upvotes, vote.downvotes);
  };
  public static toggleDownvote = (vote: VoteType, uid: string): boolean => {
    return Vote.toggleVote(uid, vote.downvotes, vote.upvotes);
  };
  public static toggleVote = (
    uid: string,
    array: Set<string>,
    otherArray: Set<string>
  ): boolean => {
    const deleted = array.delete(uid);
    if (!deleted) {
      array.add(uid);
      // when adding, make sure the uid is removed from the other array
      otherArray.delete(uid);
      return true;
    }
    return false;
  };
  public static hasUpvoted = (vote: VoteType, uid: string): boolean => {
    return vote.upvotes.has(uid);
  };
  public static hasDonwvoted = (vote: VoteType, uid: string): boolean => {
    return vote.downvotes.has(uid);
  };
}

export interface ReplyType {
  author: AuthorType;
  date: number;
  content: string;
  votes: VoteType;
}
export class Reply {
  public static now = (author: AuthorType, content: string): ReplyType =>
    ({
      author,
      date: dateNow(),
      content,
      votes: Vote.empty(),
    } as ReplyType);
  public static converter = FireConvertTo<ReplyType>(
    Reply.now({ displayName: '', photoURL: '', uid: '' }, '')
  );
}
