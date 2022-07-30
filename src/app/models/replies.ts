import { dateNow, FireConvertTo } from './firestore';
import { Author } from './user';

export interface Vote {
  upvotes: Set<string>;
  downvotes: Set<string>;
}

export const VoteEmpty = (): Vote => {
  return {
    upvotes: new Set<string>(),
    downvotes: new Set<string>(),
  };
};
export const VoteGetBalance = (vote: Vote): number => {
  return vote.upvotes.size - vote.downvotes.size;
};
export const VoteToggleUpvote = (vote: Vote, uid: string): void => {
  VoteToggleVote(uid, vote.upvotes, vote.downvotes);
};
export const VoteToggleDownvote = (vote: Vote, uid: string): void => {
  VoteToggleVote(uid, vote.downvotes, vote.upvotes);
};
export const VoteToggleVote = (
  uid: string,
  array: Set<string>,
  otherArray: Set<string>
): void => {
  const deleted = array.delete(uid);
  if (!deleted) {
    array.add(uid);
    // when adding, make sure the uid is removed from the other array
    otherArray.delete(uid);
  }
};
export const VoteHasUpvoted = (vote: Vote, uid: string): boolean => {
  return vote.upvotes.has(uid);
};
export const VoteHasDonwvoted = (vote: Vote, uid: string): boolean => {
  return vote.downvotes.has(uid);
};

export interface Reply {
  author: Author;
  date: number;
  content: string;
  votes: Vote;
}
export const ReplyNow = (author: Author, content: string): Reply =>
  ({
    author,
    date: dateNow(),
    content,
    votes: VoteEmpty(),
  } as Reply);
export const ReplyConverter = FireConvertTo<Reply>(
  ReplyNow({ displayName: '', photoURL: '', uid: '' }, '')
);
