import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAX_REPLY_LENGTH } from 'src/app/constants/reply';

@Component({
  selector: 'app-reply-dialog',
  templateUrl: './reply-dialog.component.html',
  styleUrls: ['./reply-dialog.component.css'],
})
export class ReplyDialogComponent implements OnInit {
  public MAX_REPLY_LENGTH = MAX_REPLY_LENGTH;
  public formGroup?: FormGroup;
  get content() {
    return this.formGroup?.get('content');
  }

  constructor(
    private dialogRef: MatDialogRef<ReplyDialogComponent>,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      content: [
        '',
        [
          Validators.required,
          Validators.maxLength(MAX_REPLY_LENGTH),
          Validators.minLength(1),
        ],
      ],
    });
  }

  public cancel = () => this.dialogRef.close();

  public send = (): void => {
    if (this.formGroup?.invalid) return this.formGroup.markAllAsTouched();
    this.dialogRef.close(this.content?.value);
  };
}
