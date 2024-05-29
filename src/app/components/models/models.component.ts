import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/services/user';

import { UserService } from 'src/app/services/user.service';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.scss'],
})
export class ModelsComponent implements OnInit {
  users: User[] = [];
  images = new Map<string, any>();
  displayedUsers: User[] = [];
  @ViewChild('filtersBox', { static:false, read: ElementRef }) filtersBox: any;
  showFilters: boolean = false;

  // Filters
  men = true;
  women = true;
  nonbinary = true;
  othergender = true;
  heightF = 48;
  heightT = 90;
  waistF = 20;
  waistT = 50;
  hipF = 20;
  hipT = 60;
  chestF = 20;
  chestT = 60;
  shoeF = 4;
  shoeT = 15;

  constructor(
    private userService: UserService,
    private imageService: ImageService,
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.userService.getUsers().subscribe(async users => {
      users.sort((a, b) => a.firstname.localeCompare(b.firstname) || a.lastname.localeCompare(b.lastname));
      this.users = users;
      this.displayedUsers = this.users.filter((value) => value.ispublic);
      this.images = await this.imageService.getThumbnails(this.users);
    });
  }

  getImage(filename: string) {
    if (filename && this.images.has(filename)) return this.images.get(filename);
  }

  array(n: number) {
    return Array(n);
  }

  floor(n: number): number {
    return Math.floor(n);
  }

  fillSlider(from: HTMLInputElement, to: HTMLInputElement, controlSlider: HTMLInputElement) {
    const max = parseInt(to.max);
    const min = parseInt(to.min);
    const start = parseInt(from.value);
    const end = parseInt(to.value);
    let rangeDistance = max - min;
    const fromPosition = start - min;
    const toPosition = end - min;
    let sliderColor = '#aaa';
    let fillColor = '#000';
    controlSlider.style.background = `linear-gradient(
          to right,
          ${sliderColor} 0%,
          ${sliderColor} ${(fromPosition / rangeDistance) * 100}%,
          ${fillColor} ${(fromPosition / rangeDistance) * 100}%,
          ${fillColor} ${(toPosition / rangeDistance) * 100}%, 
          ${sliderColor} ${(toPosition / rangeDistance) * 100}%, 
          ${sliderColor} 100%)`;
  }

  changeFrom(fromSlider: any, toSlider: any, display: any, type: number) {
    let from: number = parseInt((fromSlider as HTMLInputElement).value);
    let to: number = parseInt((toSlider as HTMLInputElement).value);
    if (from >= to) {
      fromSlider.value = to - 1;
      from = to - 1;
    }
    if (type == 0) (display as HTMLElement).innerHTML = Math.floor(from / 12) + "' " + (from % 12) + '"';
    else if (type == 1) (display as HTMLElement).innerHTML = from + '"';
    else (display as HTMLElement).innerHTML = from + '';
    this.fillSlider(fromSlider, toSlider, toSlider);
  }

  changeTo(fromSlider: any, toSlider: any, display: any, type: number) {
    let from: number = parseInt((fromSlider as HTMLInputElement).value);
    let to: number = parseInt((toSlider as HTMLInputElement).value);
    if (from >= to) {
      toSlider.value = from + 1;
      to = from + 1;
    }
    if (type == 0) (display as HTMLElement).innerHTML = Math.floor(to / 12) + "' " + (to % 12) + '"';
    else if (type == 1) (display as HTMLElement).innerHTML = to + '"';
    else (display as HTMLElement).innerHTML = to + '';
    this.fillSlider(fromSlider, toSlider, toSlider);
  }

  addUserToDisplayed(user: User) {
    if (!user.ispublic) return;
    // Gender
    if (user.gender == 'Man' && !this.men) return;
    if (user.gender == 'Woman' && !this.women) return;
    if (user.gender == 'Non-binary/non-conforming' && !this.nonbinary) return;
    if ((user.gender == 'Other' || user.gender == 'N/A') && !this.othergender) return;
    // Height
    if (user.height == null) {
      if (this.heightT != 90 || this.heightF != 48) return;
    } else {
      if (user.height > this.heightT) return;
      if (user.height < this.heightF) return;
    }
    // Waist
    if (user.waist == null) {
      if (this.waistT != 50 || this.waistF != 20) return;
    } else {
      if (user.waist > this.waistT) return;
      if (user.waist < this.waistF) return;
    }
    // Hip
    if (user.hip == null) {
      if (this.hipT != 60 || this.hipF != 20) return;
    } else {
      if (user.hip > this.hipT) return;
      if (user.hip < this.hipF) return;
    }
    // Chest
    if (user.chest == null) {
      if (this.chestT != 60 || this.chestF != 20) return;
    } else {
      if (user.chest > this.chestT) return;
      if (user.chest < this.chestF) return;
    }
    // Shoe
    if (user.shoe == null) {
      if (this.shoeT != 15 || this.shoeF != 4) return;
    } else {
      if (user.shoe > this.shoeT) return;
      if (user.shoe < this.shoeF) return;
    }
    // Hair
    if (user.hair == 'N/A') {
      let checkboxes = document.getElementsByClassName('hair');
      let blank = true;
      for (var i = 0; i < checkboxes.length; i++) if (!(checkboxes[i] as HTMLInputElement).checked) blank = false;
      if (!blank) return;
    }
    if (user.hair == 'Black' && !(<HTMLInputElement>document.getElementById('hair-black')).checked) return;
    if (user.hair == 'Brown' && !(<HTMLInputElement>document.getElementById('hair-brown')).checked) return;
    if (user.hair == 'Blue' && !(<HTMLInputElement>document.getElementById('hair-blue')).checked) return;
    if (user.hair == 'Hazel' && !(<HTMLInputElement>document.getElementById('hair-hazel')).checked) return;
    if (user.hair == 'Green' && !(<HTMLInputElement>document.getElementById('hair-green')).checked) return;
    if (user.hair == 'Gray' && !(<HTMLInputElement>document.getElementById('hair-gray')).checked) return;
    if (user.hair == 'Red' && !(<HTMLInputElement>document.getElementById('hair-red')).checked) return;
    if (user.hair == 'Amber' && !(<HTMLInputElement>document.getElementById('hair-amber')).checked) return;
    if (user.hair == 'Other' && !(<HTMLInputElement>document.getElementById('hair-other')).checked) return;
    // Eyes
    if (user.eyes == 'N/A') {
      let checkboxes = document.getElementsByClassName('eyes');
      let blank = true;
      for (var i = 0; i < checkboxes.length; i++) if (!(checkboxes[i] as HTMLInputElement).checked) blank = false;
      if (!blank) return;
    }
    if (user.eyes == 'Black' && !(<HTMLInputElement>document.getElementById('eyes-black')).checked) return;
    if (user.eyes == 'Brown' && !(<HTMLInputElement>document.getElementById('eyes-brown')).checked) return;
    if (user.eyes == 'Blonde' && !(<HTMLInputElement>document.getElementById('eyes-blonde')).checked) return;
    if (user.eyes == 'Red' && !(<HTMLInputElement>document.getElementById('eyes-red')).checked) return;
    if (user.eyes == 'Gray' && !(<HTMLInputElement>document.getElementById('eyes-gray')).checked) return;
    if (user.eyes == 'White' && !(<HTMLInputElement>document.getElementById('eyes-white')).checked) return;
    if (user.eyes == 'Blue' && !(<HTMLInputElement>document.getElementById('eyes-blue')).checked) return;
    if (user.eyes == 'Purple' && !(<HTMLInputElement>document.getElementById('eyes-purple')).checked) return;
    if (user.eyes == 'Pink' && !(<HTMLInputElement>document.getElementById('eyes-pink')).checked) return;
    if (user.eyes == 'Green' && !(<HTMLInputElement>document.getElementById('eyes-green')).checked) return;
    if (user.eyes == 'Other' && !(<HTMLInputElement>document.getElementById('eyes-other')).checked) return;
    this.displayedUsers.push(user);
  }

  changeFilters() {
    this.displayedUsers = [];
    this.users.forEach((user) => {
      this.addUserToDisplayed(user);
    });
  }

  @HostListener('document:click', ['$event'])
  documentClick(event: any): void {
    if (!this.filtersBox.nativeElement.contains(event.target)) {
      this.showFilters = false;
    }
  }
}
