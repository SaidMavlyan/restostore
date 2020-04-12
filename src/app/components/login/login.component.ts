import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NotifierService } from '../../services/notifier.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(private notifierService: NotifierService,
              private router: Router) {
  }

  printError(event) {
    this.notifierService.error(event.message);
  }

  async onLoginSuccess() {
    await this.router.navigateByUrl('/');
  }
}
