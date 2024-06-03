import { Injectable } from '@angular/core';

import { Observable, from, lastValueFrom, of, throwError } from 'rxjs';

import { User } from './user';
import { switchMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ImageService } from './image.service';
import Compressor from 'compressorjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth,
    private imageService: ImageService
  ) {}

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

  getUserFromUid(uid: string): Observable<User | undefined> {
    return this.firestore.collection<User>('users').doc(uid).valueChanges();
  }

  register(user: User, password: string, photos: FileList): Observable<void> {
    return from(
      // Create an account
      this.auth.createUserWithEmailAndPassword(user.email, password)
      .then(async userCredential => {
        if (userCredential.user) {
          // Upload the photos
          let photoUrls: string[] = [];
          for (let i = 0; i < photos.length; ++i) {
            const photo = photos.item(i);
            if (photo) {
              const compressed = new File([await this.compress(photo) as Blob], photo.name);
              const url = await lastValueFrom(this.imageService.upload(compressed));
              photoUrls.push(url);
            }
          }
          user.photos = photoUrls;
          // Post the user data
          const uid = userCredential.user.uid;
          await this.firestore.collection('users').doc(uid).set(user);
        }
      })
    );
  }

  updateUser(uid: string, user: User): Observable<void> {
    return from(this.firestore.collection('users').doc(uid).update(user));
  }

  compress(file: File): Promise<File | Blob> {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.6,
        maxWidth: 1024,
        success: resolve,
        error: reject
      });
    });
  }
}
