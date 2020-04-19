import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RestoOwnerResolverService implements Resolve<string> {
  constructor(private afAuth: AngularFireAuth,
              private router: Router) {
  }

  resolve(): Observable<string> {
    return this.afAuth.user.pipe(
      take(1),
      mergeMap((user) => {
        return user.getIdTokenResult().then(token => {
          if (token.claims.role === 'owner') {
            return user.uid;
          } else {
            this.router.navigate(['/']);
            return null;
          }
        });
      }));
  }
}

