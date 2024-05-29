import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isLoggedIn$ = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn$.asObservable();

  constructor(private userService: UserService) {
    const token = localStorage.getItem('api_auth');
    const username = localStorage.getItem('api_auth_username');
    this._isLoggedIn$.next(!!token);
    this.userService.setLoggedInUser(username!);
  }

  logIn(email: string, password: string) {
    return this.userService.logIn(email, password).pipe(
      tap((response: any) => {
        localStorage.setItem('api_auth', response.token);
        localStorage.setItem('api_auth_username', response.username);
        this._isLoggedIn$.next(true);
        this.userService.setLoggedInUser(response.username);
      }),
    );
  }

  logOut() {
    localStorage.setItem('api_auth', '');
    localStorage.setItem('api_auth_username', '');
    this._isLoggedIn$.next(false);
  }

  getLoggedInUser() {
    return this.userService.getLoggedInUser();
  }
}
