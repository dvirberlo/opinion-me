import * as firebase from '@firebase/testing';
import { POSTS_PATH } from '../../src/app/constants/firestore';
import { Post, Reaction, Reactions } from '../../src/app/models/post';
import {
  anotherAuthor,
  anotherUid,
  clearDB,
  getOneMissingFieldCombinations,
  getRandomId,
  selfAuthor,
  selfUid,
  setupAdminDB,
  setupDB,
  setupUserDB,
} from './helper';

const selfPost = Post.now('test', selfAuthor, {}, 'test');
const otherPost = Post.now('test', anotherAuthor, {}, 'test');

// TODO: this is a temporary implmentation of built-in function that will come nodejs LTS will reach v17.0.29
const structuredClone = (post: Post): Post => {
  const clone = { ...post } as Post;
  clone.reactions = Reactions.empty();
  return clone;
};

const adminCreatePost = async (post: Post) => {
  const postId = getRandomId();
  const admin = await setupAdminDB();
  await admin
    .collection(POSTS_PATH)
    .doc(postId)
    .withConverter(Post.converter)
    .set(post);
  return postId;
};

after(async () => {
  await clearDB();
});

describe('Posts collection tests', () => {
  beforeEach(async () => {
    await clearDB();
  });

  it('read should be allowed', async () => {
    const postId = await adminCreatePost(otherPost);

    const db = await setupDB();
    const testDoc = db.collection(POSTS_PATH).doc(postId);
    await firebase.assertSucceeds(testDoc.get());
  });

  it('not logged write should be disallowed', async () => {
    const db = await setupDB();
    const testDoc = db
      .collection(POSTS_PATH)
      .doc(getRandomId())
      .withConverter(Post.converter);
    await firebase.assertFails(testDoc.set(otherPost));
  });
  it("other's post write should be disallowed", async () => {
    const db = await setupUserDB();
    const testDoc = db
      .collection(POSTS_PATH)
      .doc(getRandomId())
      .withConverter(Post.converter);
    await firebase.assertFails(testDoc.set(otherPost));
  });
  it('self post write should be allowed', async () => {
    const db = await setupUserDB();
    const testDoc = db
      .collection(POSTS_PATH)
      .doc(getRandomId())
      .withConverter(Post.converter);
    await firebase.assertSucceeds(testDoc.set(selfPost));
  });

  it('write without required fields should be disallowed', async () => {
    const db = await setupUserDB();
    const testDoc = db.collection(POSTS_PATH).doc(getRandomId());
    for (const docObject of await getOneMissingFieldCombinations(
      Post.converter.toFirestore(selfPost)
    ))
      await firebase.assertFails(testDoc.set(docObject));
  });

  // reactions:

  it('reaction should be allowed', async () => {
    const postId = await adminCreatePost(otherPost);

    const reacted = structuredClone(otherPost);
    reacted.reactions.react(Reaction.like, selfUid);
    const db = await setupUserDB();
    const testDoc = db
      .collection(POSTS_PATH)
      .doc(postId)
      .withConverter(Post.converter);
    await firebase.assertSucceeds(testDoc.set(reacted));
  });
  it('self unreaction should be allowed', async () => {
    const reacted = structuredClone(otherPost);
    reacted.reactions.react(Reaction.like, selfUid);
    const postId = await adminCreatePost(otherPost);

    reacted.reactions.unreact(Reaction.like, selfUid);
    const db = await setupUserDB();
    const testDoc = db
      .collection(POSTS_PATH)
      .doc(postId)
      .withConverter(Post.converter);
    await firebase.assertSucceeds(testDoc.set(reacted));
  });

  it("other's reaction should be disallowed", async () => {
    const postId = await adminCreatePost(otherPost);

    const reacted = structuredClone(otherPost);
    reacted.reactions.react(Reaction.like, anotherUid);
    const db = await setupUserDB();
    const testDoc = db
      .collection(POSTS_PATH)
      .doc(postId)
      .withConverter(Post.converter);
    await firebase.assertFails(testDoc.set(reacted));
  });
  it("other's unreaction should be disallowed", async () => {
    const reacted = structuredClone(otherPost);
    reacted.reactions.react(Reaction.like, anotherUid);
    const postId = await adminCreatePost(reacted);

    reacted.reactions.unreact(Reaction.like, anotherUid);
    const db = await setupUserDB();
    const testDoc = db
      .collection(POSTS_PATH)
      .doc(postId)
      .withConverter(Post.converter);
    await firebase.assertFails(testDoc.set(reacted));
  });

  it('doubled reaction should be disallowed', async () => {
    const postId = await adminCreatePost(otherPost);

    const reacted = Post.converter.toFirestore(otherPost);
    reacted.reactions[Reaction.like].push(selfUid);
    reacted.reactions[Reaction.like].push(selfUid);
    const db = await setupUserDB();
    const testDoc = db.collection(POSTS_PATH).doc(postId);
    await firebase.assertFails(testDoc.set(reacted));
  });
  it('two same reactions should be disallowed', async () => {
    const reacted = Post.converter.toFirestore(otherPost);
    reacted.reactions[Reaction.like].push(selfUid);
    const postId = await adminCreatePost(reacted);

    reacted.reactions[Reaction.like].push(selfUid);
    const db = await setupUserDB();
    const testDoc = db.collection(POSTS_PATH).doc(postId);
    await firebase.assertFails(testDoc.set(reacted));
  });

  it('unreacted reaction after another reacted should be allowed', async () => {
    const reacted = structuredClone(otherPost);
    reacted.reactions.react(Reaction.like, anotherUid);
    reacted.reactions.react(Reaction.dislike, selfUid);
    const postId = await adminCreatePost(reacted);

    reacted.reactions.react(Reaction.like, selfUid);
    const db = await setupUserDB();
    const testDoc = db
      .collection(POSTS_PATH)
      .doc(postId)
      .withConverter(Post.converter);
    await firebase.assertSucceeds(testDoc.set(reacted));
  });
});
