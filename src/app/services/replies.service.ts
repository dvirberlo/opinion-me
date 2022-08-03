import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  DocumentReference,
  Firestore,
  setDoc,
} from '@angular/fire/firestore';
import { getRepliesPath, REPLIES_ORDER } from '../constants/firestore';
import { MAX_REPLIES_PER_REQUEST } from '../constants/reply';
import { Doc } from '../models/firestore';
import { Reply, ReplyType } from '../models/replies';
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
    postId: string
  ): Promise<DocumentReference<ReplyType>> =>
    addDoc(
      collection(this.firestore, getRepliesPath(postId)).withConverter(
        Reply.converter
      ),
      reply
    );

  public voteUpdated = (reply: Doc<ReplyType>, postId: string): Promise<void> =>
    setDoc(
      doc(this.firestore, getRepliesPath(postId), reply.id).withConverter(
        Reply.converter
      ),
      reply.data
    );
}
