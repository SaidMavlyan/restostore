import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Roles } from '../../const/roles';
import { Subscription } from 'rxjs';
import { UserService } from '../../users/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  isLoggedIn = false;
  isOwner = false;
  isAdmin = false;
  subscription: Subscription;

  constructor(private afAuth: AngularFireAuth,
              private userService: UserService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.subscription = this.userService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      this.isOwner = user?.role === Roles.owner;
      this.isAdmin = user?.role === Roles.admin;
    });
  }

  async logout() {
    await this.afAuth.auth.signOut();
    await this.router.navigateByUrl('/');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
