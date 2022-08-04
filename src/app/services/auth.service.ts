import { Injectable } from '@angular/core';
import {
  Auth,
  getRedirectResult,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isLogged$: Observable<boolean>;

  constructor(private auth: Auth) {
    this.isLogged$ = new Observable<boolean>((observer) => {
      onAuthStateChanged(this.auth, (user) => {
        observer.next(user?.uid !== undefined);
      });
    });
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
}
