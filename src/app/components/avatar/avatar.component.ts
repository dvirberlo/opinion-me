import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.css'],
})
export class AvatarComponent implements OnInit {
  @Input() public photoURL: string = '';
  @Input() public imgClasses:
    | 'header'
    | 'postProfile'
    | 'replyProfile'
    | 'profilePage'
    | '' = '';

  constructor() {}

  ngOnInit(): void {}
}
