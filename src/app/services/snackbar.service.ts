import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SnackbarComponent } from '../components/snackbar/snackbar.component';
import { paths } from '../constants/paths';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackbar: MatSnackBar, private router: Router) {}

  private defaults: MatSnackBarConfig<any> = {
    duration: 1000,
  };

  private withIcon = (
    message: string,
    icon?: string,
    config?: MatSnackBarConfig
  ) => {
    this.snackbar.openFromComponent(SnackbarComponent, {
      ...this.defaults,
      data: {
        message,
        icon,
      },
      ...config,
    });
  };

  public error = (message: string, config?: MatSnackBarConfig) => {
    this.withIcon(message, 'priority_high', config);
  };
  public warn = (message: string, config?: MatSnackBarConfig) => {
    this.withIcon(message, 'warning', config);
  };
  public info = (message: string, config?: MatSnackBarConfig) => {
    this.withIcon(message, 'info', config);
  };
  public success = (message: string, config?: MatSnackBarConfig) => {
    this.withIcon(message, 'done', config);
  };

  public simple = (
    message: string,
    action?: { label: string; action: () => void }
  ) => {
    this.snackbar
      .open(message, action?.label, this.defaults)
      .onAction()
      .subscribe(() => action?.action());
  };

  public pleaseLogin = () => {
    this.simple('Please login to continue', {
      label: 'Login',
      action: () => this.router.navigate([paths.login]),
    });
  };
  public loggedOut = () => this.info($localize`:@@OnLogoutText:See you later!`);

  public posted = () => this.success($localize`:@@PostSentMessage:Post sent!`);

  public replied = () =>
    this.success($localize`:@@ReplySentMessage:Reply sent!`);

  public errorTryAgain = () =>
    this.error(
      $localize`:@@ErrorTryAgainMessage:An error occured, please try again!`
    );

  public updating = () =>
    this.info(
      $localize`:@@UpdatingMessage:Updating... Don't start anything important!`,
      {
        duration: 0,
      }
    );
  public updateFailed = () =>
    this.error(
      $localize`:@@UpdateFailedMessage:Could not update an essential update!\nPlease try relaunching the app.`,
      {
        duration: 0,
      }
    );
  public profileUpdated = () =>
    this.success($localize`:@@ProfileUpdatedMessage:Profile updated!`);
}
