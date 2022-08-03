import * as firebase from '@firebase/testing';
import { POSTS_PATH } from '../../src/app/constants/firestore';
import { Post, PostType, Reaction, Reactions } from '../../src/app/models/post';
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
const structuredClone = (post: PostType): PostType => {
  const clone = { ...post } as PostType;
  clone.reactions = Reactions.empty();
  Object.keys(post.reactions).forEach((key) => {
    clone.reactions[key as Reaction] = new Set<string>(
      post.reactions[key as Reaction]
    );
  });
  return clone;
};

const adminCreatePost = async (post: PostType) => {
  const postId = getRandomId();
  const admin = await setupAdminDB();
  await admin
    .collection(POSTS_PATH)
    .doc(postId)
    .withConverter(Post.converter)
    .set(post);
  return postId;
};

const updateAddReaction = (
  doc: firebase.firestore.DocumentReference,
  reaction: Reaction,
  uid: string
) =>
  doc.update({
    [`reactions.${reaction}`]: firebase.firestore.FieldValue.arrayUnion(
      uid,
      uid
    ),
  });
const updateRemoveReaction = (
  doc: firebase.firestore.DocumentReference,
  reaction: Reaction,
  uid: string
) =>
  doc.update({
    [`reactions.${reaction}`]: firebase.firestore.FieldValue.arrayRemove(uid),
  });

after(async () => {
  await clearDB();
});

describe('Posts collection tests', () => {
  beforeEach(async () => {
    await clearDB();
  });

  it('read should be allowed', async () => {
    const postId = await adminCreatePost(structuredClone(otherPost));

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
    await firebase.assertFails(testDoc.set(structuredClone(otherPost)));
  });
  it("other's post write should be disallowed", async () => {
    const db = await setupUserDB();
    const testDoc = db
      .collection(POSTS_PATH)
      .doc(getRandomId())
      .withConverter(Post.converter);
    await firebase.assertFails(testDoc.set(structuredClone(otherPost)));
  });
  it('self post write should be allowed', async () => {
    const db = await setupUserDB();
    const testDoc = db
      .collection(POSTS_PATH)
      .doc(getRandomId())
      .withConverter(Post.converter);
    await firebase.assertSucceeds(testDoc.set(structuredClone(selfPost)));
  });

  it('write without required fields should be disallowed', async () => {
    const db = await setupUserDB();
    const testDoc = db.collection(POSTS_PATH).doc(getRandomId());
    for (const docObject of await getOneMissingFieldCombinations(
      Post.converter.toFirestore(structuredClone(selfPost))
    ))
      await firebase.assertFails(testDoc.set(docObject));
  });

  // reactions:

  it('reaction should be allowed', async () => {
    const postId = await adminCreatePost(structuredClone(otherPost));

    const db = await setupUserDB();
    const testDoc = db.collection(POSTS_PATH).doc(postId);
    await firebase.assertSucceeds(
      updateAddReaction(testDoc, Reaction.like, selfUid)
    );
  });
  it('self unreaction should be allowed', async () => {
    const reacted = structuredClone(otherPost);
    Reactions.react(reacted.reactions, Reaction.like, selfUid);
    const postId = await adminCreatePost(structuredClone(otherPost));

    const db = await setupUserDB();
    const testDoc = db.collection(POSTS_PATH).doc(postId);
    await firebase.assertSucceeds(
      updateRemoveReaction(testDoc, Reaction.like, selfUid)
    );
  });

  it("other's reaction should be disallowed", async () => {
    const postId = await adminCreatePost(structuredClone(otherPost));

    const db = await setupUserDB();
    const testDoc = db.collection(POSTS_PATH).doc(postId);
    await firebase.assertFails(
      updateAddReaction(testDoc, Reaction.like, anotherUid)
    );
  });
  it("other's unreaction should be disallowed", async () => {
    const reacted = structuredClone(otherPost);
    Reactions.react(reacted.reactions, Reaction.like, anotherUid);
    const postId = await adminCreatePost(structuredClone(reacted));

    const db = await setupUserDB();
    const testDoc = db.collection(POSTS_PATH).doc(postId);
    await firebase.assertFails(
      updateRemoveReaction(testDoc, Reaction.like, anotherUid)
    );
  });

  it('doubled reaction should be disallowed', async () => {
    const postId = await adminCreatePost(structuredClone(otherPost));

    const reacted = Post.converter.toFirestore(structuredClone(otherPost));
    reacted.reactions[Reaction.like].push(selfUid);
    reacted.reactions[Reaction.like].push(selfUid);
    const db = await setupUserDB();
    const testDoc = db.collection(POSTS_PATH).doc(postId);
    await firebase.assertFails(testDoc.set(reacted));
  });
  it('two same reactions should be disallowed', async () => {
    const reacted = Post.converter.toFirestore(structuredClone(otherPost));
    reacted.reactions[Reaction.like].push(selfUid);
    const postId = await adminCreatePost(reacted);

    reacted.reactions[Reaction.like].push(selfUid);
    const db = await setupUserDB();
    const testDoc = db.collection(POSTS_PATH).doc(postId);
    await firebase.assertFails(testDoc.set(reacted));
  });

  it('unreacted reaction after another reacted should be allowed', async () => {
    const reacted = structuredClone(otherPost);
    Reactions.react(reacted.reactions, Reaction.like, anotherUid);
    Reactions.react(reacted.reactions, Reaction.dislike, selfUid);
    const postId = await adminCreatePost(structuredClone(reacted));

    const db = await setupUserDB();
    const testDoc = db.collection(POSTS_PATH).doc(postId);
    await firebase.assertSucceeds(
      updateAddReaction(testDoc, Reaction.like, selfUid)
    );
  });
});
