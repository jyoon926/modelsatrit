import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/services/user';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { ImageService } from 'src/app/services/image.service';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { lastValueFrom } from 'rxjs';
import Compressor from 'compressorjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  uploadFiles?: FileList;
  user: User | undefined;
  images = new Map<string, any>();
  photos: string[] = [];
  faTrash = faTrash;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    public authService: AuthService,
    private imageService: ImageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getUser();
  }

  deletePhoto(event: Event, photo: string): void {
    event.stopPropagation();
    if (this.photos.length == 1) {
      alert("You need at least one photo on your profile.");
    } else {
      this.photos = this.photos.filter(p => p !== photo);
    }
  }

  movePhoto(event: Event, from: number, to: number): void {
    event.stopPropagation();
    if (to >= 0 && to < this.photos.length) {
      let temp = this.photos[to];
      this.photos[to] = this.photos[from];
      this.photos[from] = temp;
    }
  }

  getUser(): void {
    if (!this.authService.getLoggedInUser()) {
      this.router.navigate(['/login'])
    }
    this.userService.getUser(this.authService.getLoggedInUser()).subscribe(async user => {
      if (user == null) this.router.navigate(['/login']);
      this.user = user;
      this.photos = user.photos;
      this.images = await this.imageService.getPhotos(user);
    });
  }

  getImage(filename: string): string {
    if (filename && this.images.has(filename)) return this.images.get(filename);
    return '';
  }

  logOut() {
    this.authService.logOut();
    this.router.navigate(['/login']);
  }

  keydown(event: any) {
    let key = event.key;
    let value = event.target.value;
    if (key !== 'Backspace' && key !== 'Tab') {
      if (!key.match(/^\d$/) || value.length >= 2) {
        event.preventDefault();
      }
    }
  }

  async upload(form: any): Promise<void> {
    await this.uploadPhoto(form);
  }

  async uploadPhoto(form: any) {
    if (this.uploadFiles) {
      for (let i = 0; i < this.uploadFiles.length; ++i) {
        const file: File | null = this.uploadFiles.item(i);
        if (file) {
          try {
            const compressedFile = new File([await this.compress(file) as Blob], file.name, { type: file.type });
            console.log(compressedFile);
            const event: any = await lastValueFrom(this.imageService.upload(compressedFile));
            this.photos.push(event.filename);
          } catch (e: any) {
            alert(e.error);
          }
        }
      }
    }
    this.update(form);
  }

  selectUpload(event: any): void {
    let large = false;
    for (let i = 0; i < event.target.files.length && !large; ++i) {
      if (event.target.files.item(i).size > 10000000) {
        large = true;
      }
    }
    if (large) {
      event.target.value = '';
      alert('Individual files cannot exceed 10MB.');
    } else {
      this.uploadFiles = event.target.files;
    }
  }

  update(form: any): void {
    let user: any = {
      _id: this.user?._id,
      email: form.email.trim(),
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      username: form.email.trim().replace('@rit.edu', ''),
      ispublic: form.public,
      gender: form.gender,
      race: form.race,
      height: form.height as number,
      waist: form.waist,
      hip: form.hip,
      chest: form.chest,
      eyes: form.eyes,
      shoe: form.shoe,
      hair: form.hair,
      bio: form.bio.trim(),
      instagram: form.instagram.trim(),
      photos: this.photos
    };
    this.userService.updateUser(this.user!.username, user as unknown as User).subscribe({
      next: (event: any) => {
        localStorage.setItem('api_auth_username', user.username);
        this.userService.setLoggedInUser(user.username);
        location.reload();
      },
      error: (err: any) => {
        alert('There was an unexpected error.');
      },
    });
  }

  togglePublic(user: User, event: Event, form: any): void {
    event.stopPropagation();
    console.log(user.ispublic);
  }

  compress(file: File) {
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
