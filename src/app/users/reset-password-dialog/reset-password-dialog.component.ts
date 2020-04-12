import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from '../../services/notifier.service';
import { User } from '../models/user';
import { UserService } from '../services/user.service';

const PASS_MIN_LEN = 8;

export const passwordMatchValidator = (control: FormGroup) => {
  const passOne = control.get('newPass');
  const passTwo = control.get('passConfirmation');

  if (passOne && passTwo && passOne.value !== passTwo.value) {
    passTwo.setErrors({mismatch: true});
    return {mismatch: true};
  } else {
    passTwo.setErrors(null);
    return null;
  }
};

@Component({
  selector: 'app-reset-password-dialog',
  templateUrl: './reset-password-dialog.component.html',
  styleUrls: ['./reset-password-dialog.component.scss']
})
export class ResetPasswordDialogComponent implements OnInit {

  form: FormGroup;
  user: User;
  hide = true;

  constructor(private fb: FormBuilder,
              private dialogRef: MatDialogRef<ResetPasswordDialogComponent>,
              private notifierService: NotifierService,
              private userService: UserService,
              @Inject(MAT_DIALOG_DATA) user: User) {
    this.user = user;
  }

  ngOnInit() {
    this.form = this.fb.group({
      password: ['', [Validators.required]],
      newPass: ['', [Validators.required, Validators.minLength(PASS_MIN_LEN)]],
      passConfirmation: ['', [Validators.required]],
    }, {validators: passwordMatchValidator});
  }

  getValidationMessage(field: string) {
    if (this.form.controls[field].hasError('required')) {
      return 'You must enter a value';
    }

    switch (field) {
      case 'newPass':
        return this.form.controls.newPass.hasError('minlength') ?
          `Password should be at least ${PASS_MIN_LEN} characters` : '';
      case 'passConfirmation':
        return this.form.controls.passConfirmation.hasError('mismatch') ?
          `Passwords don't match` : '';
      default:
        return 'Please enter correct value';
    }
  }

  close() {
    this.dialogRef.close();
  }

  reset() {
    this.userService.resetPassword(this.user.uid, this.form.value.password, this.form.value.newPass)
        .subscribe(() => {
          this.notifierService.info(`Password for ${this.user.email} has been successfully changed.`);
          this.dialogRef.close(true);
        });
  }
}
