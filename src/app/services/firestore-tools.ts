import {
  collection,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  getDoc,
  getDocFromCache,
  getDocFromServer,
  getDocs,
  getDocsFromCache,
  getDocsFromServer,
  limit,
  orderBy,
  Query,
  QueryConstraint,
  QuerySnapshot,
  startAfter,
} from '@angular/fire/firestore';
import { query } from '@firebase/firestore';
import { RECENT_MILLIS } from '../constants/firestore';
import { Doc, FireCache, FireConverter, Order } from '../models/firestore';

export class CursorReader<T> {
  public cursor?: DocumentSnapshot<T>;
  public hasMore: boolean = true;
  public docs: Doc<T>[] = [];
  public isLoading: boolean = false;

  constructor(
    private firestore: Firestore,
    public path: string,
    public order: Order,
    public qLimit: number,
    private converter: FireConverter,
    private queryUniqueId: string,
    private moreQueries: QueryConstraint[] = [],
    private cachePolicy: FireCache = FireCache.BalancedRecent,
    private recentDelta?: number
  ) {
    this.clear();
  }

  public clear = () => {
    this.cursor = undefined;
    this.hasMore = true;
    this.docs = [];
    this.isLoading = false;
  };

  public read = () =>
    new Promise<void>((resolve, reject) => {
      if (!this.hasMore) return reject();
      this.isLoading = true;
      this.cursorRead(this.cursor).then(async (queryResults) => {
        await this.formatQuery(queryResults);
        // update hasMore and isLoading
        this.hasMore = queryResults.size >= this.qLimit;
        this.isLoading = false;
        resolve();
      });
    });

  private cursorRead = (
    cursor?: DocumentSnapshot<T>
  ): Promise<QuerySnapshot<T>> => {
    const queryCollection = collection(this.firestore, this.path);
    // sorry, I didn't find a better way to do this
    const queryQ =
      cursor === undefined
        ? query(
            queryCollection,
            orderBy(this.order.field, this.order.direction),
            limit(this.qLimit),
            ...this.moreQueries
          )
        : query(
            queryCollection,
            orderBy(this.order.field, this.order.direction),
            limit(this.qLimit),
            startAfter(cursor),
            ...this.moreQueries
          );
    return readDocs<T>(
      queryQ,
      this.converter,
      this.queryUniqueId,
      this.cachePolicy,
      this.recentDelta
    );
  };

  private formatQuery = async (
    queryResults: QuerySnapshot<T>,
    append: boolean = false
  ): Promise<void> => {
    // add the cursor and the new docs except the last one
    const newDocs: Doc<T>[] = [];

    if (!append && this.cursor !== undefined)
      newDocs.push(new Doc<T>(this.cursor?.id, this.cursor?.data() as T));

    let idx = 0;
    queryResults.forEach((doc) => {
      if (idx < this.qLimit - 1) newDocs.push(new Doc<T>(doc.id, doc.data()));
      idx++;
    });

    if (append) this.docs.unshift(...newDocs);
    else this.docs.push(...newDocs);

    // update cursor
    this.cursor = queryResults.docs.at(-1);
  };

  public addedToTop = (doc: Doc<T>) => {
    this.docs.unshift(doc);
  };

  // public docUpdated = async (originalDoc: Doc<T>) => {
  //   readDoc<T>(
  //     doc(this.firestore, this.path, originalDoc.id),
  //     this.converter,
  //     FireCache.ServerOnly
  //   ).then((snap: DocumentSnapshot<T>) => {
  //     const data = snap.data();
  //     if (data) originalDoc.data = data;
  //   });
  // };
}

const thePast: { [key: string]: number } = {};
export const isRecent = (id: string, delta: number): boolean => {
  const now = Date.now();
  if (id in thePast) {
    const time = thePast[id];
    if (now - time >= delta) {
      thePast[id] = now;
      return false;
    }
    return true;
  }
  thePast[id] = now;
  return false;
};

const actByTime = <T>(
  id: string,
  recentlyAction: () => T,
  oldAction: () => T,
  recentDeleta: number = RECENT_MILLIS
): T => {
  if (isRecent(id, recentDeleta)) return recentlyAction();
  return oldAction();
};

export const readDoc = <T>(
  docR: DocumentReference,
  converter: FireConverter,
  cachePolicy: FireCache = FireCache.BalancedRecent,
  recentDelta?: number
): Promise<DocumentSnapshot<T>> => {
  switch (cachePolicy) {
    case FireCache.ServerOnly:
      return getDocFromServer(docR.withConverter(converter));
    case FireCache.Server:
      return getDoc(docR.withConverter(converter));
    case FireCache.BalancedRecent:
      return actByTime<Promise<DocumentSnapshot<T>>>(
        docR.path,
        () => getDocFromCache(docR.withConverter(converter)),
        () => getDoc(docR.withConverter(converter)),
        recentDelta
      );
    case FireCache.CacheOnly:
      return getDocFromCache(docR.withConverter(converter));
  }
};

export const readDocs = <T>(
  qry: Query,
  converter: FireConverter,
  id: string,
  cachePolicy: FireCache = FireCache.BalancedRecent,
  recentDelta?: number
): Promise<QuerySnapshot<T>> => {
  switch (cachePolicy) {
    case FireCache.ServerOnly:
      return getDocsFromServer(qry.withConverter(converter));
    case FireCache.Server:
      return getDocs(qry.withConverter(converter));
    case FireCache.BalancedRecent:
      return actByTime<Promise<QuerySnapshot<T>>>(
        id,
        () => getDocsFromCache(qry.withConverter(converter)),
        () => getDocs(qry.withConverter(converter)),
        recentDelta
      );
    case FireCache.CacheOnly:
      return getDocsFromCache(qry.withConverter(converter));
  }
};
