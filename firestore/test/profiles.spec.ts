import * as firebase from '@firebase/testing';
import { PROFILES_PATH } from '../../src/app/constants/firestore';
import { Profile } from '../../src/app/models/profile';
import {
  anotherUid,
  clearDB,
  getOneMissingFieldCombinations,
  selfUid,
  selfUser,
  setupUserDB,
} from './helper';

const dummyProfile = Profile.fromUser(selfUser);

after(async () => {
  await clearDB();
});

describe('Profiles collection tests', () => {
  beforeEach(async () => {
    await clearDB();
  });

  it('self read should be allowed', async () => {
    const db = await setupUserDB();
    const testDoc = db.collection(PROFILES_PATH).doc(selfUid);
    await firebase.assertSucceeds(testDoc.get());
  });
  it('self write should be allowed', async () => {
    const db = await setupUserDB();
    const testDoc = db
      .collection(PROFILES_PATH)
      .doc(selfUid)
      .withConverter(Profile.converter);
    await firebase.assertSucceeds(testDoc.set(dummyProfile));
  });

  it('write without required fields should be disallowed', async () => {
    const db = await setupUserDB();
    const testDoc = db.collection(PROFILES_PATH).doc(selfUid);
    for (const docObject of await getOneMissingFieldCombinations(
      Profile.converter.toFirestore(dummyProfile)
    ))
      await firebase.assertFails(testDoc.set(docObject));
  });

  it('others read should be allowed', async () => {
    const db = await setupUserDB();
    const testDoc = db.collection(PROFILES_PATH).doc(anotherUid);
    await firebase.assertSucceeds(testDoc.get());
  });

  it('others write should be disallowed', async () => {
    const db = await setupUserDB();
    const testDoc = db
      .collection(PROFILES_PATH)
      .doc(anotherUid)
      .withConverter(Profile.converter);
    await firebase.assertFails(testDoc.set(dummyProfile));
  });
});
