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
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else if (error.status && error.statusText) {
      const msg = `Backend returned ${error.status}: ${error.error?.message || error.statusText}`;
      this.notifierService.error(msg);
    } else {
      this.notifierService.error(String(error));
    }
    return throwError('Server error; please try again later.');
  }
}
