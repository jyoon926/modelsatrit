import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/services/user';
import { AuthService } from 'src/app/services/auth.service';
import { ImageService } from 'src/app/services/image.service';
import { lastValueFrom } from 'rxjs';
import Compressor from 'compressorjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  photos?: FileList;
  photoNames: string[] = [];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private imageService: ImageService,
    private router: Router,
  ) {}

  register(form: any): void {
    if (!/^([a-zA-Z0-9_\-\.]+)@rit.edu$/.test(form.email)) return;
    let user = {
      username: form.email.trim().replace('@rit.edu', ''),
      email: form.email.trim(),
      password: form.password,
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      public: true,
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
      photos: this.photoNames
    };
    console.log(user)
    this.userService.register(user as unknown as User).subscribe(() => {
      this.authService.logIn(user.email, form.password).subscribe(
        (res) => {
          this.router.navigate(['/profile']);
        },
        (err) => {
          alert('There was an unexpected error while registering.');
        },
      );
    });
  }

  logIn(email: string, password: string): void {
    this.authService.logIn(email, password).subscribe();
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

  async upload(form: any) {
    if (this.photos) {
      for (let i = 0; i < this.photos.length; ++i) {
        const file: File | null = this.photos.item(i);
        if (file) {
          try {
            const compressedFile = new File([await this.compress(file) as Blob], file.name);
            console.log(compressedFile);
            const event: any = await lastValueFrom(this.imageService.upload(compressedFile));
            this.photoNames.push(event.filename);
          } catch (e: any) {
            alert(e.error);
          }
        }
      }
      this.register(form);
    }
  }

  selectPhotos(event: any): void {
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
      this.photos = event.target.files;
    }
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
