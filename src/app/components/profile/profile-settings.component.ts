import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { User } from '../../users/models/user';
import { ResetPasswordDialogComponent } from '../../users/reset-password-dialog/reset-password-dialog.component';
import { UserService } from '../../users/services/user.service';
import { UserDeleteDialogComponent } from '../../users/user-delete-dialog/user-delete-dialog.component';
import { UserDialogComponent } from '../../users/user-dialog/user-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent {

  uid: string;
  dialogConfig = new MatDialogConfig();

  constructor(
    private dialog: MatDialog,
    public userService: UserService,
  ) {
    this.dialogConfig.autoFocus = true;
    this.dialogConfig.width = '400px';
  }

  edit(user: User) {
    this.dialogConfig.data = user;

    this.dialog.open(UserDialogComponent, this.dialogConfig)
        .afterClosed()
        .subscribe((status) => {
          if (status) {
            this.userService.reloadCurrentUser();
          }
        });
  }

  delete(user: User) {
    this.dialogConfig.data = {user};
    this.dialog.open(UserDeleteDialogComponent, this.dialogConfig);
  }

  resetPassword(user: User) {
    this.dialogConfig.data = user;
    this.dialog.open(ResetPasswordDialogComponent, this.dialogConfig)
      .afterClosed()
      .subscribe((status) => {
        if (status) {
          this.userService.reloadCurrentUser();
        }
      });
  }
}
