import { dateNow, FireConvertTo } from './firestore';
import { Author } from './profile';
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

export type ReactionsInterface = {
  [key in Reaction]: Set<string>;
};

export class Reactions implements ReactionsInterface {
  constructor(
    public like: Set<string> = new Set<string>(),
    public dislike: Set<string> = new Set<string>(),
    public love: Set<string> = new Set<string>(),
    public haha: Set<string> = new Set<string>(),
    public wow: Set<string> = new Set<string>(),
    public angry: Set<string> = new Set<string>()
  ) {}
  public static empty = () => {
    return new Reactions();
  };

  public react(reaction: Reaction, userId: string) {
    this[reaction].add(userId);
  }
  public unreact(reaction: Reaction, userId: string) {
    this[reaction].delete(userId);
  }

  public toggleReaction(reaction: Reaction, userId: string) {
    const deleted = this[reaction].delete(userId);
    if (!deleted) this[reaction].add(userId);
  }
  public getReactionCount(reaction: Reaction): number {
    return this[reaction].size;
  }

  public hasReacted(reaction: Reaction, userId: string): boolean {
    return this[reaction].has(userId);
  }

  public hasReactions(reaction: Reaction): boolean {
    return this[reaction].size > 0;
  }
  public hasAllReactions(): boolean {
    for (const reaction in this)
      if (this[reaction as Reaction].size === 0) return false;
    return true;
  }
}

export class Post {
  constructor(
    public title: string,
    public author: Author,
    public date: number,
    public tags: TagsMap,
    public content: string,
    public reactions: Reactions = Reactions.empty()
  ) {}

  public static now = (
    title: string,
    author: Author,
    tags: TagsMap,
    content: string
  ): Post => new Post(title, author, dateNow(), tags, content);

  public static tagsNow = (
    title: string,
    author: Author,
    tagsList: Set<Tag>,
    content: string
  ): Post => {
    const date = dateNow();
    const tags: TagsMap = {};
    tagsList.forEach((tag) => (tags[tag] = date));
    return new Post(title, author, date, tags, content);
  };

  public static converter = FireConvertTo<Post>(
    () => Post.now('', new Author('', '', ''), {}, ''),
    ['tags']
  );
}
