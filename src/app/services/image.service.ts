import { Injectable } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  constructor(
    private storage: AngularFireStorage
  ) {}

  upload(file: File): Observable<string> {
    const fileRef = this.storage.ref(file.name);
    const task = this.storage.upload(file.name, file);
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
