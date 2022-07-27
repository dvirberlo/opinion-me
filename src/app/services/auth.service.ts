import { Injectable } from '@angular/core';
import {
  Auth,
  getRedirectResult,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  User as AuthUser,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isLogged: boolean = false;
  public isLogged$: Observable<boolean>;

  constructor(private auth: Auth) {
    this.isLogged$ = new Observable<boolean>((observer) => {
      onAuthStateChanged(this.auth, (user) => {
        this.updateLoggedStatus(user);
        observer.next(this.isLogged);
      });
    });
    // self-subscribe to the Observable to update the logged status
    this.isLogged$.subscribe((isLogged) => (this.isLogged = isLogged));
  }

  // redirects to google sign in method
  public googleLogin = () => this.OAuthLogin(new GoogleAuthProvider());
  public microsoftLogin = () =>
    this.OAuthLogin(new OAuthProvider('microsoft.com'));
  public githubLogin = () => this.OAuthLogin(new GithubAuthProvider());

  private OAuthLogin = (
    provider: OAuthProvider | GoogleAuthProvider | GithubAuthProvider
  ) =>
    new Promise<void>((resolve, reject) => {
      signInWithRedirect(this.auth, provider);
      getRedirectResult(this.auth)
        .then(() => resolve())
        .catch(reject);
    });

  public logout = (): Promise<void> => {
    return this.auth.signOut();
  };

  private updateLoggedStatus(user: AuthUser | null | undefined) {
    this.isLogged = user?.uid !== undefined;
  }
}
