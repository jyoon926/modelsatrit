import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { tap, Observable, of, lastValueFrom, finalize } from 'rxjs';
import { UserService } from './user.service';
import { User } from './user';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private baseUrl = environment.serverUrl + '/images';
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private storage: AngularFireStorage
  ) {}

  upload(file: File) {
    const fileRef = this.storage.ref(file.name);
    const task = this.storage.upload(file.name, file);

    // Return an observable with the download URL after the file has been uploaded
    return new Observable<string>((observer) => {
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(url => {
            observer.next(url);
            observer.complete();
          });
        })
      ).subscribe();
    });
  }

  getUploadProgress(filePath: string, file: File): Observable<number | undefined> {
    const task = this.storage.upload(filePath, file);
    return task.percentageChanges();
  }
}
