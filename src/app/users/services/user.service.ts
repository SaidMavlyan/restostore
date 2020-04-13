import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { LoaderService } from '../../services/loader.service';
import { User } from '../models/user';
import { Roles } from '../../const/roles';

export interface CreateUserRequest {
  displayName: string;
  password: string;
  email: string;
  role: string;
}

function mapUser(user: User): User {
  return ({
    ...user,
    isAdmin: user.role === Roles.admin,
    isOwner: user.role === Roles.owner,
  });
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = `${environment.baseUrl}/api/users`;
  currentUser$ = new BehaviorSubject<User>(null);

  constructor(private http: HttpClient,
              private afAuth: AngularFireAuth,
              private errorHandler: ErrorHandlerService,
              private loaderService: LoaderService) {
    this.afAuth.user.subscribe((user) => {
      if (user?.uid) {
        this.getUser(user.uid).subscribe(currentUser => {
          this.currentUser$.next(mapUser(currentUser));
        });
      } else {
        this.currentUser$.next(null);
      }
    });
  }

  reloadCurrentUser() {
    this.getUser(this.currentUser$.getValue().uid)
        .pipe(take(1))
        .subscribe(user => {
          this.currentUser$.next(mapUser(user));
        });
  }

  getUsers({limit, page, sortField, sortDirection}) {
    this.loaderService.show();
    let params = new HttpParams();

    if (limit) {
      params = params.set('limit', limit.toString());
    }

    if (page) {
      params = params.set('page', page.toString());
    }

    if (sortField && sortDirection) {
      params = params.set('sort', sortField + ':' + sortDirection);
    }

    return this.http.get<{ totalSize: number; users: User[] }>(`${this.baseUrl}`, {params})
               .pipe(
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => this.loaderService.hide())
               );
  }

  getUser(id: string): Observable<User> {
    this.loaderService.show();
    return this.http.get<{ user: User }>(`${this.baseUrl}/${id}`)
               .pipe(
                 map(result => result.user),
                 catchError(this.errorHandler.onHttpError),
                 finalize(() => this.loaderService.hide())
               );
  }

  create(user: CreateUserRequest): Observable<string> {
    this.loaderService.show();
    return this.http.post<{ uid: string }>(`${this.baseUrl}`, user).pipe(
      map(result => result.uid),
      catchError(this.errorHandler.onHttpError),
      finalize(() => this.loaderService.hide())
    );
  }

  edit(user: User): Observable<string> {
    this.loaderService.show();
    return this.http.patch<{ uid: string }>(`${this.baseUrl}/${user.uid}`, user).pipe(
      map(result => result.uid),
      catchError(this.errorHandler.onHttpError),
      finalize(() => this.loaderService.hide())
    );
  }

  delete(user: User) {
    this.loaderService.show();
    return this.http.delete(`${this.baseUrl}/${user.uid}`).pipe(
      catchError(this.errorHandler.onHttpError),
      finalize(() => this.loaderService.hide())
    );
  }

  resetPassword(uid: string, password: string, newPassword: string) {
    this.loaderService.show();
    return this.http.post(`${this.baseUrl}/${uid}/reset-password`, {password, newPassword}).pipe(
      catchError(this.errorHandler.onHttpError),
      finalize(() => this.loaderService.hide())
    );
  }
}

