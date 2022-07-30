import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Doc } from 'src/app/models/firestore';
import { Profile } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  public id: string = '';
  public profile?: Doc<Profile>;
  public isLoaded: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id') || '';
      this.loadProfile();
    });
  }
  private loadProfile = () => {
    this.userService.getProfile(this.id).then((profile) => {
      this.profile = new Doc<Profile>(this.id, profile);
      this.isLoaded = true;
    });
  };
}
