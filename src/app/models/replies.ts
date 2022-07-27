import { dateNow, FireConvertTo } from './firestore';
import { Author } from './profile';

export class Vote {
  constructor(public upvotes: Set<string>, public downvotes: Set<string>) {}

  public static empty(): Vote {
    return new Vote(new Set<string>(), new Set<string>());
  }

  public getBalance(): number {
    return this.upvotes.size - this.downvotes.size;
  }

  public toggleUpvote(uid: string): void {
    this.toggleVote(uid, this.upvotes, this.downvotes);
  }
  public toggleDownvote(uid: string): void {
    this.toggleVote(uid, this.downvotes, this.upvotes);
  }
  private toggleVote(
    uid: string,
    array: Set<string>,
    otherArray: Set<string>
  ): void {
    const deleted = array.delete(uid);
    if (!deleted) {
      array.add(uid);
      // when adding, make sure the uid is removed from the other array
      otherArray.delete(uid);
    }
  }

  public hasUpvoted(uid: string): boolean {
    return this.upvotes.has(uid);
  }
  public hasDonwvoted(uid: string): boolean {
    return this.downvotes.has(uid);
  }
}

export class Reply {
  constructor(
    public author: Author,
    public date: number,
    public content: string,
    public votes: Vote
  ) {}

  public static now = (author: Author, content: string): Reply =>
    new Reply(author, dateNow(), content, Vote.empty());

  public static converter = FireConvertTo<Reply>(() =>
    Reply.now(new Author('', '', ''), '')
  );
}
