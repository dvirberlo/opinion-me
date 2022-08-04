import { Injectable } from '@angular/core';
import {
  arrayRemove,
  doc,
  Firestore,
  onSnapshot,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable, shareReplay } from 'rxjs';
import { NOTIFICATIONS_PATH } from '../constants/firestore';
import {
  Notifications,
  NotificationsType,
  ReplyOnPost,
} from '../models/notifications';
import { readDoc } from './firestore-tools';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  public n9ns: Observable<NotificationsType>;

  constructor(private firestore: Firestore, private userService: UserService) {
    this.userService.$user.subscribe((user) => {
      if (!user) return;
      this.initializeListener(user.id);
    });
    this.n9ns = new Observable<NotificationsType>((observer) =>
      observer.next(Notifications.empty())
    );
  }

  private initializeListener = (uid: string): void => {
    this.n9ns = new Observable<NotificationsType>((observer) => {
      const docRef = doc(this.firestore, NOTIFICATIONS_PATH, uid).withConverter(
        Notifications.converter
      );
      // read and listen for updates
      readDoc<NotificationsType>(docRef, Notifications.converter).then((doc) =>
        observer.next(doc.data())
      );
      onSnapshot(docRef, (doc) => observer.next(doc.data()));
    }).pipe(shareReplay(1));
  };

  public dismiss = (obj: ReplyOnPost, uid: string): Promise<void> =>
    updateDoc(doc(this.firestore, NOTIFICATIONS_PATH, uid), {
      repliesOnPosts: arrayRemove(obj),
    });
}
