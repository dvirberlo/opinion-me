import * as firebase from '@firebase/testing';
import { getRepliesPath, POSTS_PATH } from '../../src/app/constants/firestore';
import { Post, PostType } from '../../src/app/models/post';
import {
  Reply,
  ReplyType,
  Vote,
  VoteArrName,
} from '../../src/app/models/replies';
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

// TODO: this is a temporary implmentation of built-in function that will come nodejs LTS will reach v17.0.29
// (tried to use it with v17.0.29, but something else refused to work)
const structuredClone = (reply: ReplyType): ReplyType => {
  const clone = { ...reply } as ReplyType;
  clone.votes = Vote.empty();
  clone.votes.upvotes = new Set<string>(reply.votes.upvotes);
  clone.votes.downvotes = new Set<string>(reply.votes.downvotes);
  return clone;
};

const anotherPost = Post.now('test', anotherAuthor, {}, 'test');
const anotherReply = Reply.now(anotherAuthor, 'test');
const selfReply = Reply.now(selfAuthor, 'test');

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
const adminCreateReply = async (postId: string, reply: ReplyType) => {
  const replyId = getRandomId();
  const admin = await setupAdminDB();
  await admin
    .collection(getRepliesPath(postId))
    .doc(replyId)
    .withConverter(Reply.converter)
    .set(reply);
  return replyId;
};

const updateAddVote = (
  doc: firebase.firestore.DocumentReference,
  uid: string,
  voteArr: VoteArrName = 'upvotes'
) =>
  doc.update({
    [`votes.${voteArr}`]: firebase.firestore.FieldValue.arrayUnion(uid),
    [`votes.${voteArr === 'upvotes' ? 'downvotes' : 'upvotes'}`]:
      firebase.firestore.FieldValue.arrayRemove(uid),
  });

const updateRemoveVote = (
  doc: firebase.firestore.DocumentReference,
  uid: string,
  voteArr: VoteArrName = 'upvotes'
) =>
  doc.update({
    [`votes.${voteArr}`]: firebase.firestore.FieldValue.arrayRemove(uid),
  });

after(async () => {
  await clearDB();
});

describe('Replies collection tests', () => {
  beforeEach(async () => {
    await clearDB();
  });

  it('read should be allowed', async () => {
    const postId = await adminCreatePost(anotherPost);
    const replyId = await adminCreateReply(
      postId,
      structuredClone(anotherReply)
    );

    const db = await setupDB();
    const testDoc = db.collection(getRepliesPath(postId)).doc(replyId);
    await firebase.assertSucceeds(testDoc.get());
  });

  it('self write should be allowed', async () => {
    const postId = getRandomId();
    const replyId = getRandomId();

    const db = await setupUserDB();
    const testDoc = db
      .collection(getRepliesPath(postId))
      .doc(replyId)
      .withConverter(Reply.converter);
    await firebase.assertSucceeds(testDoc.set(structuredClone(selfReply)));
  });

  it('write without required fields should be disallowed', async () => {
    const postId = getRandomId();
    const replyId = getRandomId();

    const db = await setupUserDB();
    const testDoc = db.collection(getRepliesPath(postId)).doc(replyId);
    for (const docObject of await getOneMissingFieldCombinations(
      Reply.converter.toFirestore(structuredClone(selfReply))
    ))
      await firebase.assertFails(testDoc.set(docObject));
  });

  it("other's reply write should be disallowed", async () => {
    const postId = getRandomId();
    const replyId = getRandomId();

    const db = await setupUserDB();
    const testDoc = db
      .collection(getRepliesPath(postId))
      .doc(replyId)
      .withConverter(Reply.converter);
    await firebase.assertFails(testDoc.set(structuredClone(anotherReply)));
  });
  it('not logged write should be disallowed', async () => {
    const postId = getRandomId();
    const replyId = getRandomId();

    const db = await setupDB();
    const testDoc = db
      .collection(getRepliesPath(postId))
      .doc(replyId)
      .withConverter(Reply.converter);
    await firebase.assertFails(testDoc.set(structuredClone(selfReply)));
  });

  // // votes:

  it('one vote should be allowed', async () => {
    const postId = await adminCreatePost(anotherPost);
    const replyId = await adminCreateReply(
      postId,
      structuredClone(anotherReply)
    );

    const db = await setupUserDB();
    const testDoc = db.collection(getRepliesPath(postId)).doc(replyId);
    await firebase.assertSucceeds(updateAddVote(testDoc, selfUid, 'upvotes'));
  });
  it('remove one vote should be allowed', async () => {
    const postId = await adminCreatePost(anotherPost);

    const voted = structuredClone(anotherReply);
    voted.votes.upvotes.add(selfUid);
    const replyId = await adminCreateReply(postId, structuredClone(voted));

    const db = await setupUserDB();
    const testDoc = db.collection(getRepliesPath(postId)).doc(replyId);
    await firebase.assertSucceeds(
      updateRemoveVote(testDoc, selfUid, 'upvotes')
    );
  });
  it("one vote after another's vote should be allowed", async () => {
    const postId = await adminCreatePost(anotherPost);
    const voted = structuredClone(anotherReply);
    voted.votes.upvotes.add(anotherUid);
    const replyId = await adminCreateReply(postId, structuredClone(voted));

    const db = await setupUserDB();
    const testDoc = db.collection(getRepliesPath(postId)).doc(replyId);
    await firebase.assertSucceeds(updateAddVote(testDoc, selfUid, 'upvotes'));
  });
  it('one non-self vote should be disallowed', async () => {
    const postId = await adminCreatePost(anotherPost);
    const replyId = await adminCreateReply(
      postId,
      structuredClone(anotherReply)
    );

    const db = await setupUserDB();
    const testDoc = db.collection(getRepliesPath(postId)).doc(replyId);
    await firebase.assertFails(updateAddVote(testDoc, anotherUid, 'upvotes'));
  });
  it('one author vote should be disallowed', async () => {
    const postId = await adminCreatePost(anotherPost);
    const replyId = await adminCreateReply(postId, structuredClone(selfReply));

    const db = await setupUserDB();
    const testDoc = db.collection(getRepliesPath(postId)).doc(replyId);
    await firebase.assertFails(updateAddVote(testDoc, selfUid, 'upvotes'));
  });

  it('double vote should be disallowed', async () => {
    const postId = await adminCreatePost(anotherPost);
    const replyId = await adminCreateReply(
      postId,
      structuredClone(anotherReply)
    );

    const voted = Reply.converter.toFirestore(structuredClone(anotherReply));
    voted.votes.upvotes.push(selfUid);
    voted.votes.upvotes.push(selfUid);

    const db = await setupUserDB();
    const testDoc = db.collection(getRepliesPath(postId)).doc(replyId);
    await firebase.assertFails(testDoc.set(voted));
  });
  it('vote when already voted should be disallowed', async () => {
    const postId = await adminCreatePost(anotherPost);
    const voted = Reply.converter.toFirestore(structuredClone(anotherReply));
    voted.votes.upvotes.push(selfUid);
    const replyId = await adminCreateReply(postId, voted);

    const votedTwice = Reply.converter.toFirestore(
      structuredClone(anotherReply)
    );
    votedTwice.votes.upvotes.push(selfUid);
    votedTwice.votes.downvotes.push(selfUid);
    const db = await setupUserDB();
    const testDoc = db.collection(getRepliesPath(postId)).doc(replyId);
    await firebase.assertFails(testDoc.set(votedTwice));
  });
  it('double different vote should be disallowed', async () => {
    const postId = await adminCreatePost(anotherPost);
    const replyId = await adminCreateReply(
      postId,
      structuredClone(anotherReply)
    );

    const voted = Reply.converter.toFirestore(structuredClone(anotherReply));
    voted.votes.upvotes.push(selfUid);
    voted.votes.downvotes.push(anotherUid);

    const db = await setupUserDB();
    const testDoc = db.collection(getRepliesPath(postId)).doc(replyId);
    await firebase.assertFails(testDoc.set(voted));
  });

  it('double delete different vote should be disallowed', async () => {
    const postId = await adminCreatePost(anotherPost);
    const voted = Reply.converter.toFirestore(structuredClone(anotherReply));
    voted.votes.upvotes.push(selfUid);
    voted.votes.downvotes.push(anotherUid);
    const replyId = await adminCreateReply(postId, voted);

    const db = await setupUserDB();
    const testDoc = db
      .collection(getRepliesPath(postId))
      .doc(replyId)
      .withConverter(Reply.converter);
    await firebase.assertFails(testDoc.set(structuredClone(anotherReply)));
  });

  it('switch from upvote to downvote at once should be allowed', async () => {
    const postId = await adminCreatePost(anotherPost);
    const voted = Reply.converter.toFirestore(structuredClone(anotherReply));
    voted.votes.upvotes.push(selfUid);
    const replyId = await adminCreateReply(postId, voted);

    const db = await setupUserDB();
    const testDoc = db.collection(getRepliesPath(postId)).doc(replyId);
    // updateAddVote switch by default
    await firebase.assertSucceeds(updateAddVote(testDoc, selfUid, 'upvotes'));
  });

  it('create reply with non-empty votes map should be disallowed', async () => {
    const postId = await adminCreatePost(anotherPost);
    const replyId = getRandomId();

    const voted = Reply.converter.toFirestore(structuredClone(anotherReply));
    voted.votes.upvotes.push(selfUid);

    const db = await setupUserDB();
    const testDoc = db.collection(getRepliesPath(postId)).doc(replyId);
    await firebase.assertFails(testDoc.set(voted));
  });
});
