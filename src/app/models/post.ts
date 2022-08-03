import { dateNow, FireConvertTo } from './firestore';
import { AuthorType } from './user';
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

export type ReactionsType = {
  [key in Reaction]: Set<string>;
};
export class Reactions {
  public static empty = (): ReactionsType => ({
    [Reaction.like]: new Set(),
    [Reaction.dislike]: new Set(),
    [Reaction.love]: new Set(),
    [Reaction.haha]: new Set(),
    [Reaction.wow]: new Set(),
    [Reaction.angry]: new Set(),
  });
  public static react = (
    reactions: ReactionsType,
    reaction: Reaction,
    userId: string
  ) => {
    reactions[reaction].add(userId);
  };
  public static unreact = (
    reactions: ReactionsType,
    reaction: Reaction,
    userId: string
  ) => {
    reactions[reaction].delete(userId);
  };
  public static toggleReaction = (
    reactions: ReactionsType,
    reaction: Reaction,
    userId: string
  ) => {
    const deleted = reactions[reaction].delete(userId);
    if (!deleted) reactions[reaction].add(userId);
  };
  public static getReactionCount = (
    reactions: ReactionsType,
    reaction: Reaction
  ): number => {
    return reactions[reaction].size;
  };
  public static hasReacted = (
    reactions: ReactionsType,
    reaction: Reaction,
    userId: string
  ): boolean => {
    return reactions[reaction].has(userId);
  };
  public static hasReactions = (
    reactions: ReactionsType,
    reaction: Reaction
  ): boolean => {
    return reactions[reaction].size > 0;
  };
  public static hasAllReactions = (reactions: ReactionsType): boolean => {
    for (const reaction in reactions)
      if (reactions[reaction as Reaction].size === 0) return false;
    return true;
  };
}

export interface PostType {
  title: string;
  author: AuthorType;
  date: number;
  tags: TagsMap;
  content: string;
  reactions: ReactionsType;
}

export class Post {
  public static now = (
    title: string,
    author: AuthorType,
    tags: TagsMap,
    content: string
  ): PostType =>
    ({
      title,
      author,
      date: dateNow(),
      tags,
      content,
      reactions: Reactions.empty(),
    } as PostType);

  public static tagsNow = (
    title: string,
    author: AuthorType,
    tagsList: Set<Tag>,
    content: string
  ): PostType => {
    const date = dateNow();
    const tags: TagsMap = {};
    tagsList.forEach((tag) => (tags[tag] = date));
    return { title, author, date, tags, content, reactions: Reactions.empty() };
  };

  public static converter = FireConvertTo<PostType>(
    Post.now('', { displayName: '', photoURL: '', uid: '' }, {}, '')
  );
}
