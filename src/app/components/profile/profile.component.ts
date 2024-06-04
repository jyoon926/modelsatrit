import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/misc/user';
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
  uid: string | undefined;
  photos: string[] = [];
  faTrash = faTrash;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  loading: boolean = false;
  @ViewChild('uploadTarget') uploadTarget: ElementRef | undefined; 

  constructor(
    private userService: UserService,
    public authService: AuthService,
    private imageService: ImageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getUser();
  }

  getUser(): void {
    this.authService.getUser().subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
      } else {
        this.uid = user.uid;
        this.userService.getUserFromUid(user.uid).subscribe(res => {
          this.user = res;
          this.photos = res!.photos;
        });
      }
    });
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

  logout() {
    this.authService.logout();
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
    this.loading = true;
    if (this.uploadFiles) {
      for (let i = 0; i < this.uploadFiles.length; ++i) {
        const file: File | null = this.uploadFiles.item(i);
        if (file) {
          try {
            const compressedFile = new File([await this.compress(file) as Blob], file.name);
            const url = await lastValueFrom(this.imageService.upload(compressedFile));
            this.photos.push(url);
          } catch (e: any) {
            alert(e.error);
          }
        }
      }
    }
    this.uploadTarget!.nativeElement.value = '';
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
      email: form.email,
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      ispublic: form.public,
      gender: form.gender != 'N/A' ? form.gender : undefined,
      race: form.race != 'N/A' ? form.race : undefined,
      height: form.height ? form.height : undefined,
      waist: form.waist ? form.waist : undefined,
      hip: form.hip ? form.hip : undefined,
      chest: form.chest ? form.chest : undefined,
      eyes: form.eyes != 'N/A' ? form.eyes : undefined,
      shoe: form.shoe ? form.shoe : undefined,
      hair: form.hair != 'N/A' ? form.hair : undefined,
      bio: form.bio ? form.bio.trim() : undefined,
      instagram: form.instagram ? form.instagram.trim() : undefined,
      photos: this.photos
    };
    Object.keys(user).forEach(key => user[key] === undefined && delete user[key]);
    this.userService.updateUser(this.uid!, user as unknown as User).subscribe({
      next: () => {
        this.loading = false;
      },
      error: () => {
        alert('There was an unexpected error.');
      }
    });
  }

  togglePublic(user: User, event: Event, form: any): void {
    event.stopPropagation();
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
