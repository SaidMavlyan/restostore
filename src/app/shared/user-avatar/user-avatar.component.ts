import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  template: `
    <div>
      <img *ngIf="photoURL; else defaultAvatar" [src]="photoURL"
           alt="user's avatar"
           class="avatar mat-elevation-z2">
      <ng-template #defaultAvatar>
        <mat-icon class="avatar mat-elevation-z2">account_circle</mat-icon>
      </ng-template>
    </div>
  `,
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent {

  @Input() photoURL: string;

  constructor() {
  }
}
