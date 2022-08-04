import * as firebase from '@firebase/testing';
import { NOTIFICATIONS_PATH } from '../../src/app/constants/firestore';
import {
  Notifications,
  NotificationsType,
} from '../../src/app/models/notifications';
import {
  anotherAuthor,
  anotherUid,
  clearDB,
  selfAuthor,
  selfUid,
  setupAdminDB,
  setupDB,
  setupUserDB,
} from './helper';

const adminCreateNotifications = async (
  notifications: NotificationsType,
  uid: string
) => {
  const admin = await setupAdminDB();
  await admin
    .collection(NOTIFICATIONS_PATH)
    .doc(uid)
    .withConverter(Notifications.converter)
    .set(notifications);
};

after(async () => {
  await clearDB();
});

describe('Notifications collection tests', () => {
  beforeEach(async () => {
    await clearDB();
  });
  it('create self notification should be allowed', async () => {
    const db = await setupUserDB();
    const testDoc = db
      .collection(NOTIFICATIONS_PATH)
      .doc(selfUid)
      .withConverter(Notifications.converter);
    await firebase.assertSucceeds(testDoc.set(Notifications.empty()));
  });
  it("create another's notificationshould be disallow", async () => {
    const db = await setupDB();
    const testDoc = db
      .collection(NOTIFICATIONS_PATH)
      .doc(anotherUid)
      .withConverter(Notifications.converter);
    await firebase.assertFails(testDoc.set(Notifications.empty()));
  });

  it("update another's notification with self reply should be allowed", async () => {
    await adminCreateNotifications(Notifications.empty(), anotherUid);
    const db = await setupUserDB();
    const testDoc = db.collection(NOTIFICATIONS_PATH).doc(anotherUid);
    await firebase.assertSucceeds(
      testDoc.update({
        repliesOnPosts: firebase.firestore.FieldValue.arrayUnion({
          postId: '',
          title: '',
          date: 0,
          content: '',
          author: selfAuthor,
        }),
      })
    );
  });
  it("second update another's notification with self reply should be allowed", async () => {
    const nr1 = {
      postId: '',
      title: '',
      date: 0,
      content: '',
      author: selfAuthor,
    };
    const n100s = Notifications.empty();
    n100s.repliesOnPosts = [nr1];
    const nr2 = {
      ...nr1,
      postId: '2',
    };
    await adminCreateNotifications(n100s, anotherUid);
    const db = await setupUserDB();
    const testDoc = db.collection(NOTIFICATIONS_PATH).doc(anotherUid);
    await firebase.assertSucceeds(
      testDoc.update({
        repliesOnPosts: firebase.firestore.FieldValue.arrayUnion(nr2),
      })
    );
  });
  it("update another's notification with invalid self reply should be disallowed", async () => {
    await adminCreateNotifications(Notifications.empty(), anotherUid);
    const db = await setupUserDB();
    const testDoc = db.collection(NOTIFICATIONS_PATH).doc(anotherUid);
    await firebase.assertFails(
      testDoc.update({
        repliesOnPosts: firebase.firestore.FieldValue.arrayUnion({
          postId: '',
          title: '',
          // missing date
          content: '',
          author: selfAuthor,
        }),
      })
    );
  });
  it("update another's notification with another's reply should be disallowed", async () => {
    await adminCreateNotifications(Notifications.empty(), anotherUid);
    const db = await setupUserDB();
    const testDoc = db.collection(NOTIFICATIONS_PATH).doc(anotherUid);
    await firebase.assertFails(
      testDoc.update({
        repliesOnPosts: firebase.firestore.FieldValue.arrayUnion({
          postId: '',
          title: '',
          date: 0,
          content: '',
          author: anotherAuthor,
        }),
      })
    );
  });
  it("remove another's notification should be disallowed", async () => {
    const notif = Notifications.empty();
    const rNotif = {
      postId: '',
      title: '',
      date: 0,
      content: '',
      author: selfAuthor,
    };
    notif.repliesOnPosts = [rNotif];
    await adminCreateNotifications(notif, anotherUid);
    const db = await setupUserDB();
    const testDoc = db.collection(NOTIFICATIONS_PATH).doc(anotherUid);
    await firebase.assertFails(
      testDoc.update({
        repliesOnPosts: firebase.firestore.FieldValue.arrayRemove(rNotif),
      })
    );
  });
  it('self notification update should be allowed', async () => {
    const notif = Notifications.empty();
    const rNotif = {
      postId: '',
      title: '',
      date: 0,
      content: '',
      author: anotherAuthor,
    };
    notif.repliesOnPosts = [rNotif];
    await adminCreateNotifications(notif, selfUid);
    const db = await setupUserDB();
    const testDoc = db.collection(NOTIFICATIONS_PATH).doc(selfUid);
    await firebase.assertSucceeds(
      testDoc.update({
        repliesOnPosts: firebase.firestore.FieldValue.arrayRemove(rNotif),
      })
    );
  });
});
