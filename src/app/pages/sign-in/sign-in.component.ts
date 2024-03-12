import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../core/authentication/auth.service';
import { getAuth } from '@firebase/auth';
import { ISignIn } from '../../shared/models/auth.model';
import { FirebaseError } from 'firebase/app';
import { delay } from 'rxjs';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent implements OnInit {
  private authService = inject(AuthService);

  isSignedIn: boolean = false;
  signInData?: ISignIn | null;
  signInError?: FirebaseError;

  ngOnInit(): void {
    this.authService.user$.pipe(delay(1000)).subscribe((user) => {
      this.isSignedIn = !!user;
      console.log('is logged in', !!user, user);
    });
  }

  signIn() {
    this.authService.googleSignIn().subscribe(
      (signInResult: ISignIn | null) => {
        console.log('successful sign-in');
        this.signInData = signInResult;
      },
      (error: FirebaseError) => {
        console.error('Error during sign-in');
        this.signInError = error;
      }
    );
  }

  signOut() {
    this.authService.signOut().subscribe(
      () => {
        console.log('successful sign out');
      },
      () => {
        console.log('error during signing out');
      }
    );
  }
}
