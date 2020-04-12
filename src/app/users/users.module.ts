import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ResetPasswordDialogComponent } from './reset-password-dialog/reset-password-dialog.component';
import { UserDeleteDialogComponent } from './user-delete-dialog/user-delete-dialog.component';
import { UserDialogComponent } from './user-dialog/user-dialog.component';

import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users/users.component';

@NgModule({
  declarations: [
    UsersComponent,
    UserDialogComponent,
    UserDeleteDialogComponent,
    ResetPasswordDialogComponent
  ],
  entryComponents: [
    UserDialogComponent,
    UserDeleteDialogComponent,
    ResetPasswordDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    UsersRoutingModule,
  ]
})
export class UsersModule { }
