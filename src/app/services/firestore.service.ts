import { Injectable } from '@angular/core';
import { doc, Firestore } from '@angular/fire/firestore';
import { SwUpdate } from '@angular/service-worker';
import { CLIENT_VERSION, INFO_PATH } from '../constants/firestore';
import { FireCache, Info } from '../models/firestore';
import { readDoc } from './firestore-tools';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(
    private firestore: Firestore,
    private snackbarService: SnackbarService,
    private readonly swUpdate: SwUpdate
  ) {}

  public makeClientUpdated = () => {
    // if app's version is not equal to DB's version - update app.
    // NOTE: it can lead to infinite updating loop if version won't match...
    // Note: in development mode, Service Worker is not available. But hopefully, it wiil work in production...
    readDoc<Info>(
      doc(this.firestore, INFO_PATH),
      Info.converter,
      FireCache.ServerOnly
    )
      .then((snapshot) => {
        const info = snapshot.data();
        if (info !== undefined && info.version !== CLIENT_VERSION) {
          this.snackbarService.updating();
          this.swUpdate
            .activateUpdate()
            .then(window.location.reload)
            .catch(() => {
              this.snackbarService.updateFailed();
            });
        }
      })
      .catch((err) => {
        console.error(new Error('Could not fetch DB info'));
        console.error(err);
        this.snackbarService.errorTryAgain();
      });
  };
}
