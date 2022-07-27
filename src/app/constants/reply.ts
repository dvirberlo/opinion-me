import { MatDialogConfig } from '@angular/material/dialog';

export const MAX_REPLY_LENGTH: number = 256;
// must be more than 1 to prevent confusing UI
export const MAX_REPLIES_PER_REQUEST: number = 10;

export const RELPY_DIALOG_CONFIG: MatDialogConfig<any> = {
  width: '80vw',
  maxWidth: '80vw',
  maxHeight: '90vh',
};
