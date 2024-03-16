import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { User } from '@firebase/auth';
import { FirebaseError } from 'firebase/app';
import { Router } from '@angular/router';

import { AuthService } from '../../core/authentication/auth.service';
import { ISignIn } from '../../shared/models/auth.model';
import { SignOutComponent } from '../../shared/components/sign-out/sign-out.component';
import { GoogleBtnComponent } from './components/google-btn/google-btn.component';
import { CustomBtnComponent } from '../../shared/components/UI/custom-btn/custom-btn.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    SignOutComponent,
    GoogleBtnComponent,
    CustomBtnComponent,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isSignedIn: boolean = false;
  currentUser?: User | null;
  signInData?: ISignIn | null;
  signInError?: FirebaseError;

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.isSignedIn = !!user;
      this.currentUser = user;
    });
  }

  signIn() {
    this.authService.googleSignIn().subscribe(
      (signInResult: ISignIn | null) => {
        this.signInData = signInResult;
        this.router.navigateByUrl('/dictionary');
      },
      (error: FirebaseError) => {
        this.signInError = error;
      }
    );
  }

  onCancel() {
    this.router.navigateByUrl('/dictionary');
  }
}
