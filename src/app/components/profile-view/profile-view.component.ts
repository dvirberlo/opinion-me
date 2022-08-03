import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css'],
})
export class ProfileViewComponent implements OnInit {
  @Input() public photoURL: string = '';
  @Input() public displayName: string = '';
  @Input() public date: number = 1;
  @Input() public type: 'imgOnly' | 'oneLine' | 'fullPage' = 'oneLine';

  constructor() {}

  ngOnInit(): void {}
}
