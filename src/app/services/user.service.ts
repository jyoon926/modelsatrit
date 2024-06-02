import { Injectable } from '@angular/core';

import { Observable, of, throwError } from 'rxjs';

import { User } from './user';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = '/users';
  private loggedInUser: string | undefined;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient, private firestore: AngularFirestore) {}

  register(user: User) {
    user.isadmin = false;
    return this.http.post<User>(this.baseUrl + '/register', user, this.httpOptions).pipe(
      tap((newUser: User) => {
        console.log('added user w/ id=' + newUser._id);
      }),
      catchError(this.handleError<User>('addUser')),
    );
  }

  logIn(email: string, password: string) {
    const body = { email: email, password: password };
    return this.http.post(this.baseUrl + '/login', body, this.httpOptions);
  }

  updateUser(email: string, user: User) {
    return this.http.put(`${this.baseUrl}/${email}`, user, this.httpOptions).pipe(
      tap((_) => console.log(`updated user '${email}'`)),
      catchError(this.handleError<any>('updateUser')),
    );
  }

  deleteUser(email: string): Observable<User> {
    return this.http.delete<User>(`${this.baseUrl}/${email}`, this.httpOptions).pipe(
      tap((_) => console.log(`deleted user '${email}'`)),
      catchError(this.handleError<User>('deleteUser')),
    );
  }

  findUsers(term: string): Observable<User[]> {
    if (!term.trim()) {
      return of([]);
    }
    return this.http.get<User[]>(`${this.baseUrl}/?name=${term}`).pipe(
      tap((x) =>
        x.length ? console.log(`found users matching "${term}"`) : console.log(`no users matching "${term}"`),
      ),
      catchError(this.handleError<User[]>('findUsers', [])),
    );
  }

  getUsers(): Observable<User[]> {
    return this.firestore.collection<User>('users').valueChanges();
  }

  getUser(email: string): Observable<User> {
    return this.firestore.collection<User>('users', ref => ref.where('email', '==', email))
      .valueChanges()
      .pipe(
        switchMap(users => users.length > 0 ? of(users[0]) : throwError(() => new Error('User not found')))
      );
  }

  setLoggedInUser(email: string) {
    this.loggedInUser = email;
  }

  getLoggedInUser(): string {
    return this.loggedInUser!;
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }
}
