import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { merge, of, Subscription } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Roles } from '../../const/roles';
import { User } from '../models/user';
import { UserService } from '../services/user.service';
import { UserDeleteDialogComponent } from '../user-delete-dialog/user-delete-dialog.component';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {

  pageSizeOptions = [20, 50, 100];
  dialogConfig = new MatDialogConfig();
  subscriptions: Subscription[] = [];
  currentUser: User;
  displayedColumns: string[] = ['uid', 'displayName', 'email', 'role', 'actions'];
  dataSource = new MatTableDataSource<User>();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private dialog: MatDialog,
    private httpClient: HttpClient,
    private userService: UserService,
  ) {
    this.subscriptions.push(
      this.userService.currentUser$.subscribe(user => this.currentUser = user)
    );
  }

  ngOnInit() {
    this.dialogConfig.width = '400px';
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.userService.getUsers({
            page: this.paginator.pageIndex,
            limit: this.paginator.pageSize,
            sortField: this.sort.active,
            sortDirection: this.sort.direction
          });
        }),
        map(data => {
          this.paginator.length = data.totalSize;
          return data.users;
        }),
        catchError(() => {
          return of([]);
        })
      ).subscribe(users => this.dataSource.data = users);
  }

  createUser() {
    this.dialogConfig.data = {};
    this.openUserDialog();
  }

  editUser(user: User) {
    this.dialogConfig.data = user;
    this.openUserDialog();
  }

  openUserDialog() {
    this.dialogConfig.autoFocus = true;

    this.dialog.open(UserDialogComponent, this.dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val) {
          this.paginator.page.emit();
        }
      });
  }

  deleteUser(user: User) {
    this.dialogConfig.data = {user};

    this.dialog.open(UserDeleteDialogComponent, this.dialogConfig)
      .afterClosed()
      .subscribe((val) => {
        if (val) {
          this.paginator.page.emit();
        }
      });
  }

  isAdmin() {
    return this.currentUser?.role === Roles.admin;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(el => el.unsubscribe());
  }
}
