import * as firebase from '@firebase/testing';
import { USERS_PATH } from '../../src/app/constants/firestore';
import { UserConverter, UserNow } from '../../src/app/models/user';
import {
  anotherUid,
  clearDB,
  getOneMissingFieldCombinations,
  selfUid,
  selfUser,
  setupUserDB,
} from './helper';

const dummyUser = UserNow('test', 'test', '');

after(async () => {
  await clearDB();
});

describe('Users collection tests', () => {
  beforeEach(async () => {
    await clearDB();
  });

  it('self read should be allowed', async () => {
    const db = await setupUserDB();
    const testDoc = db.collection(USERS_PATH).doc(selfUid);
    await firebase.assertSucceeds(testDoc.get());
  });
  it('self write should be allowed', async () => {
    const db = await setupUserDB();
    const testDoc = db
      .collection(USERS_PATH)
      .doc(selfUid)
      .withConverter(UserConverter);
    await firebase.assertSucceeds(testDoc.set(dummyUser));
  });

  it('write without required fields should be disallowed', async () => {
    const db = await setupUserDB();
    const testDoc = db.collection(USERS_PATH).doc(selfUid);
    for (const docObject of await getOneMissingFieldCombinations(
      UserConverter.toFirestore(selfUser)
    ))
      await firebase.assertFails(testDoc.set(docObject));
  });

  it('others read should be disallowed', async () => {
    const db = await setupUserDB();
    const testDoc = db.collection(USERS_PATH).doc(anotherUid);
    await firebase.assertFails(testDoc.get());
  });
  it('others write should be disallowed', async () => {
    const db = await setupUserDB();
    const testDoc = db
      .collection(USERS_PATH)
      .doc(anotherUid)
      .withConverter(UserConverter);
    await firebase.assertFails(testDoc.set(dummyUser));
  });
});
