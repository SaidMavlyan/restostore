import { Component, Inject } from '@angular/core';
import { User } from '../models/user';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../services/user.service';
import { NotifierService } from '../../services/notifier.service';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-user-delete-dialog',
  templateUrl: './user-delete-dialog.component.html',
  styleUrls: ['./user-delete-dialog.component.scss']
})
export class UserDeleteDialogComponent {

  public isDeleting = false;
  public isDeletingSelf: boolean;

  constructor(private dialogRef: MatDialogRef<UserDeleteDialogComponent>,
              private notifierService: NotifierService,
              private router: Router,
              private afAuth: AngularFireAuth,
              private userService: UserService,
              @Inject(MAT_DIALOG_DATA) public data: { user: User }) {
    this.isDeletingSelf = this.userService.currentUser$.value.uid === data.user.uid;
  }

  delete() {
    this.isDeleting = true;
    this.userService.delete(this.data.user)
        .subscribe(() => {
          this.isDeleting = true;
          if (this.isDeletingSelf) {
            this.onCurrentAccountDeletion(this.data.user.email);
            this.dialogRef.close();
          } else {
            this.dialogRef.close(true);
          }
        });
  }

  close() {
    this.dialogRef.close();
  }

  async onCurrentAccountDeletion(email: string) {
    try {
      await this.afAuth.auth.signOut();
      await this.router.navigateByUrl('/');
      this.notifierService.info(`Account of ${email} is successfully deleted.`);
    } catch (e) {
      this.notifierService.error(`Could not delete account`);
    }
  }

}
