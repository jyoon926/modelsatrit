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
  user: User | undefined;
  images = new Map<string, any>();

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    public authService: AuthService,
    private location: Location,
    private imageService: ImageService,
  ) {}

  ngOnInit(): void {
    this.getUser();
  }

  getUser(): void {
    const username = this.route.snapshot.paramMap.get('username');
    if (username != null) {
      this.userService.getUser(username).subscribe(async user => {
        this.user = user;
        this.images = await this.imageService.getPhotos(this.user);
      });
    }
  }

  getImage(filename: string): string {
    if (filename && this.images.has(filename)) return this.images.get(filename);
    return '';
  }

  selectImage(filename: string): void {
    let dom = document.getElementById('image');
    if (dom) {
      dom.style.backgroundImage = 'url(' + this.getImage(filename) + ')';
    }
  }

  parseInt(n: number): number {
    return parseInt(n.toString());
  }

  back(): void {
    this.location.back();
  }
}
