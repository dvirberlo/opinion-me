import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  DocumentReference,
  Firestore,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { POSTS_ORDER, POSTS_PATH } from '../constants/firestore';
import { MAX_POSTS_PER_REQUEST } from '../constants/post';
import { Doc } from '../models/firestore';
import { Post, PostConverter } from '../models/post';
import { CursorReader, readDoc } from './firestore-tools';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  constructor(private firestore: Firestore) {}

  public getPostsReader = () =>
    new CursorReader<Post>(
      this.firestore,
      POSTS_PATH,
      POSTS_ORDER,
      MAX_POSTS_PER_REQUEST,
      PostConverter,
      'posts-reader'
    );
  public getPostByTagReader = (tag: string) => {
    const tagField = `tags.${tag}`;
    return new CursorReader<Post>(
      this.firestore,
      POSTS_PATH,
      { field: tagField, direction: 'desc' },
      MAX_POSTS_PER_REQUEST,
      PostConverter,
      'posts-by-tag-reader-' + tag,
      [where(tagField, '>', 0)]
    );
  };

  public getPost = (uid: string) =>
    new Promise<Post>((resolve, reject) => {
      readDoc<Post>(doc(this.firestore, POSTS_PATH, uid), PostConverter)
        .then((snap) => {
          const data = snap.data();
          if (data) return resolve(data);
          reject();
        })
        .catch(reject);
    });

  public addPost = (post: Post): Promise<DocumentReference<Post>> =>
    addDoc(
      collection(this.firestore, POSTS_PATH).withConverter(PostConverter),
      post
    );

  public reactionUpdate = (post: Doc<Post>): Promise<void> =>
    setDoc(
      doc(this.firestore, POSTS_PATH, post.id).withConverter(PostConverter),
      post.data
    );
}
