import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';
import { paths } from '../../constants/paths';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  public paths = paths;
  constructor(
    public authService: AuthService,
    public userService: UserService,
    public snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {}

  public logout = () => {
    this.authService.logout().then(this.snackbarService.loggedOut);
  };
}
