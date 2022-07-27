import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { paths } from '../../constants/paths';

type Provider = {
  name: string;
  icon: string;
  onclick: () => void;
};

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
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

  ngOnInit(): void {
    this.authService.isLogged$.subscribe((isLogged) => {
      if (isLogged) this.router.navigateByUrl('/' + paths.home);
    });
  }
}
