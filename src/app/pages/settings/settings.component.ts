import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MAX_USERNAME_LENGTH } from 'src/app/constants/firestore';
import { paths } from 'src/app/constants/paths';
import { Doc } from 'src/app/models/firestore';
import { UserType } from 'src/app/models/user';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';

const enum FORM_FIELDS {
  displayName = 'displayName',
  email = 'email',
  photoURL = 'photoURL',
}
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  public selfUser?: UserType;
  public formGroup?: FormGroup;
  constructor(
    private userService: UserService,
    private snackbarService: SnackbarService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  public MAX_USER_NAME_LENGTH = MAX_USERNAME_LENGTH;

  get displayName() {
    return this.formGroup?.get(FORM_FIELDS.displayName);
  }
  get email() {
    return this.formGroup?.get(FORM_FIELDS.email);
  }
  get photoURL() {
    return this.formGroup?.get(FORM_FIELDS.photoURL);
  }

  ngOnInit(): void {
    this.userService.$user.subscribe((user) => {
      if (user === undefined) return;
      this.selfUser = user.data;
      this.formGroup = this.formBuilder.group({
        [FORM_FIELDS.displayName]: [
          user.data.displayName,
          [
            Validators.required,
            Validators.maxLength(MAX_USERNAME_LENGTH),
            Validators.minLength(1),
          ],
        ],
        [FORM_FIELDS.email]: [
          user.data.email,
          [Validators.required, Validators.email],
        ],
        [FORM_FIELDS.photoURL]: [
          user.data.photoURL,
          [Validators.required, Validators.pattern(/^(http|https):\/\//)],
        ],
      });
    });
  }

  public saveEdits = () => {
    if (this.formGroup?.valid && this.userService.author?.uid) {
      this.userService
        .updateUser(
          new Doc<UserType>(this.userService.author.uid, {
            ...this.selfUser,
            ...this.formGroup.value,
          })
        )
        .then(() => {
          this.router.navigate([
            '/',
            paths.profile,
            this.userService.author?.uid,
          ]);
          this.snackbarService.profileUpdated();
        });
    }
  };
}
