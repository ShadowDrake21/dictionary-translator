import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import {
  User,
  UserCredential,
  getAdditionalUserInfo,
  onAuthStateChanged,
  signInWithPopup,
} from '@firebase/auth';
import { FirebaseError } from 'firebase/app';
import {
  BehaviorSubject,
  Observable,
  catchError,
  from,
  map,
  throwError,
} from 'rxjs';

import { ISignIn } from '../../shared/models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _auth = inject(Auth);

  private _user$$: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);

  user$: Observable<User | null> = this._user$$.asObservable();

  constructor() {
    onAuthStateChanged(this._auth, (user: User | null) => {
      this._user$$.next(user);
    });
  }

  checkSignIn(): boolean {
    return !!this._auth.currentUser;
  }

  googleSignIn(): Observable<ISignIn | null> {
    const provider = new GoogleAuthProvider();
    this._auth.useDeviceLanguage();

    provider.setCustomParameters({
      login_hint: 'user@example.com',
    });

    return from(signInWithPopup(this._auth, provider)).pipe(
      map((result: UserCredential) => this.onSuccessfulSignIn(result)),
      catchError((error: FirebaseError) => throwError(error))
    );
  }

  onSuccessfulSignIn(userCredential: UserCredential) {
    const credential = GoogleAuthProvider.credentialFromResult(userCredential);
    if (credential !== null) {
      const { accessToken } = credential;
      const { user } = userCredential;
      const additionalUserInfo = getAdditionalUserInfo(userCredential);
      return {
        accessToken,
        user,
        additionalUserInfo,
      };
    } else {
      throw new Error('Unable to get credentioal from result.');
    }
  }

  signOut() {
    return from(signOut(this._auth));
  }
}
