import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { NotifierService } from './notifier.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(public notifierService: NotifierService) {
  }

  onHttpError = (error: HttpErrorResponse) => {
    let msg = null;
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else if (error.error && error.error.message) {
      msg = error.error.message;
    } else if (error.status && error.statusText) {
      msg = `Backend returned ${error.status}: ${error.error?.message || error.statusText}`;
    } else {
      msg = String(error);
    }

    return throwError(msg ? msg : 'Server error; please try again later.');
  }
}
