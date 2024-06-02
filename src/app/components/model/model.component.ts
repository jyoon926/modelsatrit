import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/services/user';
import { UserService } from 'src/app/services/user.service';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-profile',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ModelComponent implements OnInit {
  user?: User;
  error: Boolean = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    public authService: AuthService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getUser();
  }

  getUser(): void {
    const email = this.route.snapshot.paramMap.get('email')!;
    this.userService.getUser(email).subscribe({
      next: user => {
        this.user = user;
      }, error: () => {
        this.error = true;
      }
    });
  }

  selectImage(filename: string): void {
    let dom = document.getElementById('image');
    if (dom) {
      dom.style.backgroundImage = `url(${filename})`;
    }
  }

  parseInt(n: number): number {
    return parseInt(n.toString());
  }

  back(): void {
    this.location.back();
  }
}
