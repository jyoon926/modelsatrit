import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { tap, Observable, of, firstValueFrom, lastValueFrom } from 'rxjs';
import { UserService } from './user.service';
import { User } from './user';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private baseUrl = environment.serverUrl + '/images';
  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {}

  upload(file: File) {
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.http.post<File>(`${this.baseUrl}/uploadfile`, formData).pipe(
      tap(
        (message) => {
          console.log(message);
        },
        (error) => {
          console.log(error);
        },
      ),
    );
  }

  getImage(filename: string): Observable<Blob> {
    const url = `${this.baseUrl}/get/${filename}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  async getAllThumbnails(): Promise<Map<string, any>> {
    let users = await lastValueFrom(this.userService.getUsers());
    users = users.filter(user => user.ispublic && user.photos.length);
    return await this.getThumbnails(users);
  }

  async getThumbnails(users: User[]): Promise<Map<string, any>> {
    let images = new Map<string, any>();
    users = users.filter(user => user.photos.length);
    users.forEach(async user => {
      let blob: Blob = await firstValueFrom(this.getImage(user.photos[0]));
      let objectURL = URL.createObjectURL(blob);
      images.set(user.photos[0], objectURL);
    });
    return images;
  }

  async getPhotos(user: User): Promise<Map<string, any>> {
    let images = new Map<string, any>();
    user.photos.forEach(async photo => {
      let blob: Blob = await firstValueFrom(this.getImage(photo));
      let objectURL = URL.createObjectURL(blob);
      images.set(photo, objectURL);
    });
    return images;
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
