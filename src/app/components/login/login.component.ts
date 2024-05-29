import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  logIn(email: string, password: string): void {
    this.authService.logIn(email, password).subscribe(
      (res) => {
        this.router.navigate(['/profile']);
      },
      (err) => {
        this.loginFailed();
      },
    );
  }

  loginFailed() {
    console.log('failed');
    let p = document.getElementById('failed');
    if (p != null) {
      const animation = p.animate([{ opacity: 0.6 }, { opacity: 0 }], {
        easing: 'ease',
        duration: 5000,
      });
      animation.play();
    }
  }
}
