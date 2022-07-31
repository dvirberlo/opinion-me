import { Injectable } from '@angular/core';
import { Auth, User as AuthUser } from '@angular/fire/auth';
import {
  doc,
  DocumentReference,
  Firestore,
  setDoc,
} from '@angular/fire/firestore';
import { Observable, shareReplay } from 'rxjs';
import { PROFILES_PATH, USERS_PATH } from '../constants/firestore';
import { Doc, FireCache } from '../models/firestore';
import {
  Author,
  AuthorFromUser,
  Profile,
  ProfileConverter,
  ProfileFromUser,
} from '../models/user';
import { User, UserConverter, UserNow } from './../models/user';
import { readDoc } from './firestore-tools';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public user: User | undefined;
  public author: Author | undefined;
  private uid: string | undefined;
  public $user: Observable<Doc<User> | undefined>;

  constructor(private firestore: Firestore, private auth: Auth) {
    this.$user = new Observable<Doc<User> | undefined>((subscriber) => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          this.uid = user.uid;
          this.getUserFromDB(user).then((userDoc) => {
            this.verifyProfileCreated(user.uid, userDoc);
            this.user = userDoc;
            this.author = AuthorFromUser(userDoc, user.uid);
            subscriber.next(new Doc<User>(user.uid, userDoc));
          });
        } else {
          this.uid = undefined;
          this.user = undefined;
          this.author = undefined;
          subscriber.next(undefined);
        }
      });
    }).pipe(shareReplay(1));
  }

  private getUserFromDB = async (user: AuthUser) => {
    const userRef = doc(this.firestore, USERS_PATH, user.uid).withConverter(
      UserConverter
    );
    const userSnap = await readDoc<User>(
      userRef,
      UserConverter,
      FireCache.Server
    );
    // creates new user if does not exists yet
    if (!userSnap.exists()) {
      const userDoc = await this.createNewUser(user, userRef);
      return userDoc;
    }
    return userSnap.data();
  };

  private createNewUser = async (
    user: AuthUser,
    userRef: DocumentReference<User>
  ) => {
    const userDoc = UserNow(user.email, user.displayName, user.photoURL);
    setDoc(userRef, userDoc);
    // creates also user profile
    this.createNewProfile(user.uid, ProfileFromUser(userDoc));
    return userDoc;
  };

  private verifyProfileCreated = async (uid: string, user: User) => {
    const profieSnap = await readDoc<Profile>(
      doc(this.firestore, PROFILES_PATH, uid),
      ProfileConverter,
      FireCache.Server
    );
    // creates new user profile if does not exists yet
    if (!profieSnap.exists()) this.createNewProfile(uid, user as Profile);
  };

  private createNewProfile = async (uid: string, profile: Profile) => {
    const profileRef = doc(this.firestore, PROFILES_PATH, uid).withConverter(
      ProfileConverter
    );
    setDoc(profileRef, profile);
  };

  public getProfile = (uid: string) =>
    new Promise<Profile>((resolve, reject) => {
      readDoc<Profile>(
        doc(this.firestore, PROFILES_PATH, uid),
        ProfileConverter
      )
        .then((snap) => {
          const data = snap.data();
          if (data) return resolve(data);
          reject();
        })
        .catch(reject);
    });

  public updateUser = (user: Doc<User>): Promise<void[]> => {
    const userRef = doc(this.firestore, USERS_PATH, user.id).withConverter(
      UserConverter
    );
    const profileRef = doc(
      this.firestore,
      PROFILES_PATH,
      user.id
    ).withConverter(ProfileConverter);
    return Promise.all([
      setDoc(userRef, user.data),
      setDoc(profileRef, ProfileFromUser(user.data)),
    ]);
  };
}
