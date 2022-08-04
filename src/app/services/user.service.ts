import { Injectable } from '@angular/core';
import { Auth, User as AuthUser } from '@angular/fire/auth';
import {
  doc,
  DocumentReference,
  Firestore,
  setDoc,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, shareReplay } from 'rxjs';
import { paths } from '../constants/paths';
import {
  NOTIFICATIONS_PATH,
  PROFILES_PATH,
  USERS_PATH,
} from '../constants/firestore';
import { Doc, FireCache } from '../models/firestore';
import { Notifications, NotificationsType } from '../models/notifications';
import { Author, AuthorType, Profile, ProfileType } from '../models/user';
import { User, UserType } from './../models/user';
import { readDoc } from './firestore-tools';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public user: UserType | undefined;
  public author: AuthorType | undefined;
  public $user: Observable<Doc<UserType> | undefined>;
  public isAuthLoaded: Observable<boolean>;

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private router: Router
  ) {
    this.isAuthLoaded = new Observable<boolean>((observer) => {
      observer.next(false);
      this.auth.onAuthStateChanged(() => observer.next(true));
    }).pipe(shareReplay(1));
    this.$user = new Observable<Doc<UserType> | undefined>((subscriber) => {
      this.auth.onAuthStateChanged((user) => {
        if (user)
          this.getUserFromDB(user).then((userDoc) => {
            this.verifyCreated(user.uid, userDoc);
            this.user = userDoc;
            this.author = Author.fromUser(userDoc, user.uid);
            subscriber.next(new Doc<UserType>(user.uid, userDoc));
          });
        else {
          this.user = undefined;
          this.author = undefined;
          subscriber.next(undefined);
        }
      });
    }).pipe(shareReplay(1));
  }

  private getUserFromDB = async (user: AuthUser) => {
    const userRef = doc(this.firestore, USERS_PATH, user.uid).withConverter(
      User.converter
    );
    const userSnap = await readDoc<UserType>(
      userRef,
      User.converter,
      FireCache.Server
    );
    // creates new user if does not exists yet
    if (!userSnap.exists()) {
      const userDoc = await this.registerUser(user, userRef);
      return userDoc;
    }
    return userSnap.data();
  };

  private registerUser = async (
    user: AuthUser,
    userRef: DocumentReference<UserType>
  ) => {
    const userDoc = User.now(user.email, user.displayName, user.photoURL);
    setDoc(userRef, userDoc);

    // creates also user profile & notifications
    this.createProfile(user.uid, Profile.fromUser(userDoc));
    this.createNotifications(user.uid);
    // redirect to settings page to complete profile details
    this.router.navigateByUrl('/' + paths.settings);
    return userDoc;
  };

  private verifyCreated = async (uid: string, user: UserType) => {
    const profieSnap = await readDoc<ProfileType>(
      doc(this.firestore, PROFILES_PATH, uid),
      Profile.converter,
      FireCache.Server
    );
    const notificationsSnap = await readDoc<NotificationsType>(
      doc(this.firestore, NOTIFICATIONS_PATH, uid),
      Notifications.converter,
      FireCache.Server
    );
    // creates new user profile & notifications if does not exists yet
    if (!profieSnap.exists()) this.createProfile(uid, user as ProfileType);
    if (!notificationsSnap.exists()) this.createNotifications(uid);
  };

  private createProfile = async (uid: string, profile: ProfileType) => {
    const profileRef = doc(this.firestore, PROFILES_PATH, uid).withConverter(
      Profile.converter
    );
    setDoc(profileRef, profile);
  };
  private createNotifications = async (uid: string) => {
    const notificationsRef = doc(
      this.firestore,
      NOTIFICATIONS_PATH,
      uid
    ).withConverter(Notifications.converter);
    setDoc(notificationsRef, Notifications.empty());
  };

  public getProfile = (uid: string) =>
    new Promise<ProfileType>((resolve, reject) => {
      readDoc<ProfileType>(
        doc(this.firestore, PROFILES_PATH, uid),
        Profile.converter
      )
        .then((snap) => {
          const data = snap.data();
          if (data) return resolve(data);
          reject();
        })
        .catch(reject);
    });

  public updateUser = (user: Doc<UserType>): Promise<void[]> => {
    const userRef = doc(this.firestore, USERS_PATH, user.id).withConverter(
      User.converter
    );
    const profileRef = doc(
      this.firestore,
      PROFILES_PATH,
      user.id
    ).withConverter(Profile.converter);
    return Promise.all([
      setDoc(userRef, user.data),
      setDoc(profileRef, Profile.fromUser(user.data)),
    ]);
  };
}
