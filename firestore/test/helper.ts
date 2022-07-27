import * as firebase from '@firebase/testing';
import { Author } from '../../src/app/models/profile';
import { User } from '../../src/app/models/user';

const PROJECT_ID = `opinion-me-testing`;
const getCustomPID = () => `opinion-me-testing-${Date.now()}`;
export const getRandomId = () => `rules-test-${Date.now()}`;

export const selfUid: string = 'test-user';
export const anotherUid: string = 'test-another-user';

export const selfUser: User = User.now('test-another', 'test-another', '');
export const selfAuthor: Author = Author.fromUser(selfUser, selfUid);

export const anotherUser: User = User.now('test-another', 'test-another', '');
export const anotherAuthor: Author = Author.fromUser(anotherUser, anotherUid);

export const dummyDoc = {
  name: 'dummy',
};

export const setupDB = async (isCustom = false) => {
  return await firebase
    .initializeTestApp({
      projectId: isCustom ? getCustomPID() : PROJECT_ID,
    })
    .firestore();
};

export const setupUserDB = async (isCustom = false) => {
  return await firebase
    .initializeTestApp({
      projectId: isCustom ? getCustomPID() : PROJECT_ID,
      auth: { uid: selfUid },
    })
    .firestore();
};

export const setupAdminDB = async (isCustom = false) => {
  return await firebase
    .initializeAdminApp({
      projectId: isCustom ? getCustomPID() : PROJECT_ID,
    })
    .firestore();
};

export const clearDB = async () => {
  await firebase.clearFirestoreData({ projectId: PROJECT_ID });
};

export const getOneMissingFieldCombinations = async (
  obj: any
): Promise<any[]> => {
  const combinations: any[] = [];
  let temp: any;
  for (const key of Object.keys(obj)) {
    temp = { ...obj };
    delete temp[key];
    combinations.push(temp);

    // Note: this function uses recursion (for object childs)
    if (typeof obj[key] === 'object') {
      const childCombinations = await getOneMissingFieldCombinations(obj[key]);
      childCombinations.map(
        (val: any, index: number) =>
          (childCombinations[index] = { ...obj, [key]: val })
      );
      combinations.push(...childCombinations);
    }
  }
  return combinations;
};
