import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/services/user';
import { AuthService } from 'src/app/services/auth.service';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  photos?: FileList;
  photoNames: string[] = [];
  creating: boolean = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
  ) {}

  register(form: any): void {
    this.creating = true;
    if (!this.photos) return;
    let user = {
      email: form.email.trim(),
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      ispublic: true,
      isadmin: false,
      gender: form.gender ? form.gender : undefined,
      race: form.race ? form.race : undefined,
      height: form.height !== null ? form.height : undefined,
      waist: form.waist !== null ? form.waist : undefined,
      hip: form.hip !== null ? form.hip : undefined,
      chest: form.chest !== null ? form.chest : undefined,
      eyes: form.eyes !== null ? form.eyes : undefined,
      shoe: form.shoe !== null ? form.shoe : undefined,
      hair: form.hair !== null ? form.hair : undefined,
      bio: form.bio ? form.bio.trim() : undefined,
      instagram: form.instagram ? form.instagram.trim() : undefined
    };
    this.userService.register(user as unknown as User, form.password, this.photos).subscribe(() => {
      this.router.navigate(['/profile']);
    });
  }

  login(email: string, password: string): void {
    this.authService.login(email, password).subscribe();
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
}
