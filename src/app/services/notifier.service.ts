import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

const NOTIFIER_DURATION = 7000;

@Injectable({
  providedIn: 'root'
})
export class NotifierService {

  constructor(private snackBar: MatSnackBar) {
  }

  info(msg: string) {
    this.snackBar.open(msg, 'Info', {duration: NOTIFIER_DURATION});
  }

  error(msg: string) {
    this.snackBar.open(msg, 'Error', {duration: NOTIFIER_DURATION});
  }
}
