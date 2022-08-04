import { FireConvertTo } from './firestore';
import { ReplyType } from './replies';
import { AuthorType } from './user';

export type ReplyOnPost = {
  postId: string;
  title: string;
  author: AuthorType;
  date: number;
  content: string;
};
export interface NotificationsType {
  repliesOnPosts: ReplyOnPost[];
}

export class Notifications {
  public static empty = (): NotificationsType => ({
    repliesOnPosts: [],
  });
  public static converter = FireConvertTo<NotificationsType>(
    Notifications.empty()
  );

  public static formatReply = (
    reply: ReplyType,
    postId: string,
    postTitle: string
  ): ReplyOnPost => ({
    postId,
    title: postTitle,
    author: reply.author,
    date: reply.date,
    content: reply.content,
  });
}
