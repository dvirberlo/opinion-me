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
  where,
} from '@angular/fire/firestore';
import { POSTS_ORDER, POSTS_PATH } from '../constants/firestore';
import { MAX_POSTS_PER_REQUEST } from '../constants/post';
import { Doc } from '../models/firestore';
import { Post, PostType, Reaction } from '../models/post';
import { CursorReader, readDoc } from './firestore-tools';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  constructor(private firestore: Firestore) {}

  public getPostsReader = () =>
    new CursorReader<PostType>(
      this.firestore,
      POSTS_PATH,
      POSTS_ORDER,
      MAX_POSTS_PER_REQUEST,
      Post.converter,
      'posts-reader'
    );
  public getPostByTagReader = (tag: string) => {
    const tagField = `tags.${tag}`;
    return new CursorReader<PostType>(
      this.firestore,
      POSTS_PATH,
      { field: tagField, direction: 'desc' },
      MAX_POSTS_PER_REQUEST,
      Post.converter,
      'posts-by-tag-reader-' + tag,
      [where(tagField, '>', 0)]
    );
  };

  public getPost = (uid: string) =>
    new Promise<PostType>((resolve, reject) => {
      readDoc<PostType>(doc(this.firestore, POSTS_PATH, uid), Post.converter)
        .then((snap) => {
          const data = snap.data();
          if (data) return resolve(data);
          reject();
        })
        .catch(reject);
    });

  public addPost = (post: PostType): Promise<DocumentReference<PostType>> =>
    addDoc(
      collection(this.firestore, POSTS_PATH).withConverter(Post.converter),
      post
    );

  public reactionUpdate = (post: Doc<PostType>): Promise<void> =>
    setDoc(
      doc(this.firestore, POSTS_PATH, post.id).withConverter(Post.converter),
      post.data
    );

  public updateReaction = (
    post: Doc<PostType>,
    reaction: Reaction,
    uid: string,
    add: boolean
  ): Promise<void> =>
    updateDoc(doc(this.firestore, POSTS_PATH, post.id), {
      [`reactions.${reaction}`]: add ? arrayUnion(uid) : arrayRemove(uid),
    });
}
