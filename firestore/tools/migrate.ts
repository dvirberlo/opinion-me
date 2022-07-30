import { config as envConfig } from 'dotenv';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import {
  CollectionReference,
  DocumentReference,
  getFirestore,
} from 'firebase-admin/firestore';
import { PostConverter } from '../../src/app/models/post';
import { ReplyConverter } from '../../src/app/models/replies';
import { ProfileConverter, UserConverter } from '../../src/app/models/user';

// Note: you will need to add .env in /firestore and set GOOGLE_APPLICATION_CREDENTIALS path to the .json token file
envConfig();
const DB_NAME = 'opinion-me-testing';
const VERSION = 3;

const main = async () => {
  const app = initializeApp({
    credential: applicationDefault(),
    databaseURL: `https://${DB_NAME}.firebaseio.com`,
  });
  const db = getFirestore(app);

  const converters: any = {
    users: UserConverter,
    profiles: ProfileConverter,
    posts: PostConverter,
    replies: ReplyConverter,
  };
  // this should work:
  const dbCollections = await db.listCollections();
  dbCollections.map((col) => {
    mapAllDocs(col, async (doc: DocumentReference) => {
      const collectionName = doc.path.split('/').at(-2);
      if (
        collectionName === undefined ||
        converters[collectionName] === undefined
      )
        return;
      // just read and write the doc with the converter
      const converter = converters[collectionName];
      const data = (await doc.withConverter(converter).get()).data();
      if (data) await doc.withConverter(converter).set(data);
    });
  });
  // setInfo(db.collection('info'), VERSION);
};

const mapAllDocs = async (
  collection: CollectionReference,
  action: (doc: DocumentReference) => Promise<void>,
  recursive: boolean = true
) => {
  (await collection.listDocuments()).map(async (doc) => {
    if (recursive)
      (await doc.listCollections()).map((col) =>
        mapAllDocs(col, action, recursive)
      );
    action(doc);
  });
};

const setInfo = (collection: CollectionReference, version: number) =>
  collection.doc('0').set({ version });

main();
