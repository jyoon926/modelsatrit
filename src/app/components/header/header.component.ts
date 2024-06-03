import { Component, OnInit } from '@angular/core';
import { from, lastValueFrom } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  
  constructor(private authService: AuthService) {}

  get isLoggedIn() {
    return this.authService.isLoggedIn;
  }

  hideMenu() {
    let checkbox = document.getElementById('checkbox') as HTMLInputElement;
    if (checkbox.checked) {
      checkbox.checked = false;
    }
  }

  logout() {
    this.authService.logout();
  }
}
