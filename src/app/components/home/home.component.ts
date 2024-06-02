import { Component, HostBinding, HostListener } from '@angular/core';
import { ImageService } from 'src/app/services/image.service';
import { User } from 'src/app/services/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  users: User[] = [];

  constructor(
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.userService.getUsers().subscribe(users => {
      users.sort((a, b) => a.firstname.localeCompare(b.firstname) || a.lastname.localeCompare(b.lastname));
      this.users = users.filter(value => value.ispublic && value.photos.length);
    });
  }
}

const images = document.getElementsByClassName('model-image');

let globalIndex = 0, last = { x: 0, y: 0 };

const activate = (image: HTMLElement, x: number, y: number) => {
  if (image) {
    image.style.left = `${x}px`;
    image.style.top = `${y}px`;
    image.style.zIndex = '' + globalIndex;
    image.classList.add('active');
    last = { x, y };
  }
};

const deactivate = (image: HTMLElement) => {
  if (image) {
    image.classList.remove('active');
  }
};

const distanceFromLast = (x: number, y: number) => {
  return Math.hypot(x - last.x, y - last.y);
};

window.onmousemove = (e) => {
  if (distanceFromLast(e.clientX, e.clientY) > window.innerWidth / 25) {
    const lead = images[globalIndex % images.length];
    const tail = images[(globalIndex - Math.min(15, images.length - 1)) % images.length];
    activate(lead as HTMLElement, e.clientX, e.clientY);
    deactivate(tail as HTMLElement);
    globalIndex++;
  }
};
