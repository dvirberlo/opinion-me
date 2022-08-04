import { Injectable } from '@angular/core';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  DocumentReference,
  Firestore,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import {
  getRepliesPath,
  NOTIFICATIONS_PATH,
  REPLIES_ORDER,
} from '../constants/firestore';
import { MAX_REPLIES_PER_REQUEST } from '../constants/reply';
import { Doc } from '../models/firestore';
import { Notifications } from '../models/notifications';
import { PostType } from '../models/post';
import { Reply, ReplyType, VoteArrName } from '../models/replies';
import { CursorReader } from './firestore-tools';

@Injectable({
  providedIn: 'root',
})
export class RepliesService {
  constructor(private firestore: Firestore) {}

  public getRepliesReader = (postId: string) =>
    new CursorReader<ReplyType>(
      this.firestore,
      getRepliesPath(postId),
      REPLIES_ORDER,
      MAX_REPLIES_PER_REQUEST,
      Reply.converter,
      'posts-reader-' + postId
    );

  public addReply = (
    reply: ReplyType,
    post: Doc<PostType>
  ): Promise<DocumentReference<ReplyType>> => {
    // send notification to post author
    if (post.data.author.uid)
      updateDoc(doc(this.firestore, NOTIFICATIONS_PATH, post.data.author.uid), {
        repliesOnPosts: arrayUnion(
          Notifications.formatReply(reply, post.id, post.data.title)
        ),
      });
    return addDoc(
      collection(this.firestore, getRepliesPath(post.id)).withConverter(
        Reply.converter
      ),
      reply
    );
  };

  public voteUpdated = (reply: Doc<ReplyType>, postId: string): Promise<void> =>
    setDoc(
      doc(this.firestore, getRepliesPath(postId), reply.id).withConverter(
        Reply.converter
      ),
      reply.data
    );

  public vote = (
    voteArr: VoteArrName,
    uid: string,
    reply: Doc<ReplyType>,
    postId: string
  ): Promise<void> =>
    updateDoc(doc(this.firestore, getRepliesPath(postId), reply.id), {
      [`votes.${voteArr}`]: arrayUnion(uid),
      [`votes.${voteArr === 'upvotes' ? 'downvotes' : 'upvotes'}`]:
        arrayRemove(uid),
    });
  public unvote = (
    voteArr: VoteArrName,
    uid: string,
    reply: Doc<ReplyType>,
    postId: string
  ): Promise<void> =>
    updateDoc(doc(this.firestore, getRepliesPath(postId), reply.id), {
      [`votes.${voteArr}`]: arrayRemove(uid),
    });
}
