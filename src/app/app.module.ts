import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireAuthGuardModule } from '@angular/fire/auth-guard';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileSettingsComponent } from './components/profile/profile-settings.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { AuthTokenHttpInterceptorProvider } from './services/auth-token.interseptor';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProgressBarComponent,
    HeaderComponent,
    ProfileSettingsComponent,
  ],
  imports: [
    BrowserModule,
    SharedModule,
    AppRoutingModule,
    AngularFireAuthModule,
    AngularFireAuthGuardModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    BrowserAnimationsModule,
    MatPasswordStrengthModule.forRoot(),
    UsersModule,
    RestaurantsModule,
    NgxAuthFirebaseUIModule.forRoot(
      environment.firebase,
      () => undefined,
      {
        enableFirestoreSync: true,
        toastMessageOnAuthSuccess: false,
        toastMessageOnAuthError: false
      }),
  ],
  exports: [],
  providers: [
    AuthTokenHttpInterceptorProvider
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
