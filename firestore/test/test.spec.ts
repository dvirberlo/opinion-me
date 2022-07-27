import * as firebase from '@firebase/testing';
import { clearDB, dummyDoc, setupDB } from './helper';

after(async () => {
  await clearDB();
});

describe('Basic tests', () => {
  beforeEach(async () => {
    await clearDB();
  });
  it('random read should be disallow', async () => {
    const db = await setupDB();
    const testDoc = db.collection('nonexisted').doc('nonexisted');
    await firebase.assertFails(testDoc.get());
  });
  it('random write should be disallow', async () => {
    const db = await setupDB();
    const testDoc = db.collection('nonexisted').doc('nonexisted');
    await firebase.assertFails(testDoc.set(dummyDoc));
  });
});
