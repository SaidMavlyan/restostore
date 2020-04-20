import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HeaderComponent } from './components/header/header.component';
import { ProfileSettingsComponent } from './components/profile/profile-settings.component';
import { AngularFireAuthGuard, customClaims, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';
import { Roles } from './const/roles';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const isAdmin = () => {
  return pipe(customClaims, map(claims => claims.role === Roles.admin));
};

const routes: Routes = [
  {
    path: '',
    component: HeaderComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./restaurants/restaurants.module').then(m => m.RestaurantsModule)
      },
      {
        path: 'settings',
        component: ProfileSettingsComponent,
        canActivate: [AngularFireAuthGuard], data: {authGuardPipe: redirectUnauthorizedToLogin}
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.module').then(m => m.UsersModule),
        canActivate: [AngularFireAuthGuard], data: {authGuardPipe: isAdmin}
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '**',
    redirectTo: '/'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
