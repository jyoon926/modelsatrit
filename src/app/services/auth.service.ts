import { Injectable, OnInit } from '@angular/core';
import { Observable, from, of, switchMap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  uid: string | undefined;
  isLoggedIn: boolean = true;

  constructor(private auth: AngularFireAuth) {}

  setLoggedIn() {
    this.getUser().subscribe(res => {
      if (res) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    });
  }

  login(email: string, password: string): Observable<firebase.default.auth.UserCredential> {
    return from(this.auth.signInWithEmailAndPassword(email, password).then(userCredential => {
      this.uid = userCredential.user?.uid;
      this.isLoggedIn = true;
      return userCredential;
    }));
  }

  logout(): Observable<void> {
    this.uid = undefined;
    this.isLoggedIn = false;
    return from(this.auth.signOut());
  }

  addUser(email: string, password: string): Observable<firebase.default.auth.UserCredential> {
    return from(this.auth.createUserWithEmailAndPassword(email, password).then(userCredential => {
      this.uid = userCredential.user?.uid;
      this.isLoggedIn = true;
      return userCredential;
    }));
  }

  getUser(): Observable<firebase.default.User | null> {
    return this.auth.authState;
  }
}
