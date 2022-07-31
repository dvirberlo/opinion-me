import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { paths } from 'src/app/constants/paths';
import { AuthService } from 'src/app/services/auth.service';

type Provider = {
  name: string;
  icon: string;
  onclick: () => void;
};

@Component({
  selector: 'app-login-buttons',
  templateUrl: './login-buttons.component.html',
  styleUrls: ['./login-buttons.component.css'],
})
export class LoginButtonsComponent implements OnInit {
  public providers: Provider[] = [
    {
      name: 'Google',
      icon: 'google',
      onclick: () => this.login(this.authService.googleLogin),
    },
    // {
    //   name: 'Microsoft',
    //   icon: 'microsoft',
    //   onclick: () => this.login(this.authService.microsoftLogin),
    // },
    // {
    //   name: 'Github',
    //   icon: 'github',
    //   onclick: () => this.login(this.authService.githubLogin),
    // },
  ];

  private login = (action: () => Promise<void>) => {
    action().then(() => this.router.navigateByUrl('/' + paths.home));
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}
}
