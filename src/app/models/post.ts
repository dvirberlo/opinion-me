import { dateNow, FireConvertTo } from './firestore';
import { Author } from './user';
import { Tag } from './tags';

export type TagsMap = { [key in Tag]?: number };

export enum Reaction {
  like = 'like',
  dislike = 'dislike',
  love = 'love',
  haha = 'haha',
  wow = 'wow',
  angry = 'angry',
}
export const ReactionsList = Object.keys(Reaction) as Reaction[];

export type Reactions = {
  [key in Reaction]: Set<string>;
};

export const ReactionsEmpty = (): Reactions => ({
  [Reaction.like]: new Set(),
  [Reaction.dislike]: new Set(),
  [Reaction.love]: new Set(),
  [Reaction.haha]: new Set(),
  [Reaction.wow]: new Set(),
  [Reaction.angry]: new Set(),
});
export const ReactionsReact = (
  reactions: Reactions,
  reaction: Reaction,
  userId: string
) => {
  reactions[reaction].add(userId);
};
export const ReactionsUnreact = (
  reactions: Reactions,
  reaction: Reaction,
  userId: string
) => {
  reactions[reaction].delete(userId);
};
export const ReactionsToggleReaction = (
  reactions: Reactions,
  reaction: Reaction,
  userId: string
) => {
  const deleted = reactions[reaction].delete(userId);
  if (!deleted) reactions[reaction].add(userId);
};
export const ReactionsGetReactionCount = (
  reactions: Reactions,
  reaction: Reaction
): number => {
  return reactions[reaction].size;
};
export const ReactionsHasReacted = (
  reactions: Reactions,
  reaction: Reaction,
  userId: string
): boolean => {
  return reactions[reaction].has(userId);
};
export const ReactionsHasReactions = (
  reactions: Reactions,
  reaction: Reaction
): boolean => {
  return reactions[reaction].size > 0;
};
export const ReactionsHasAllReactions = (reactions: Reactions): boolean => {
  for (const reaction in reactions)
    if (reactions[reaction as Reaction].size === 0) return false;
  return true;
};

export interface Post {
  title: string;
  author: Author;
  date: number;
  tags: TagsMap;
  content: string;
  reactions: Reactions;
}

export const PostNow = (
  title: string,
  author: Author,
  tags: TagsMap,
  content: string
): Post =>
  ({
    title,
    author,
    date: dateNow(),
    tags,
    content,
    reactions: ReactionsEmpty(),
  } as Post);

export const PostTagsNow = (
  title: string,
  author: Author,
  tagsList: Set<Tag>,
  content: string
): Post => {
  const date = dateNow();
  const tags: TagsMap = {};
  tagsList.forEach((tag) => (tags[tag] = date));
  return { title, author, date, tags, content, reactions: ReactionsEmpty() };
};

export const PostConverter = FireConvertTo<Post>(
  PostNow('', { displayName: '', photoURL: '', uid: '' }, {}, '')
);
