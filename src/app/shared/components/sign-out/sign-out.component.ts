import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/authentication/auth.service';
import { CustomBtnComponent } from '../UI/custom-btn/custom-btn.component';

@Component({
  selector: 'auth-sign-out',
  standalone: true,
  imports: [CommonModule, CustomBtnComponent],
  templateUrl: './sign-out.component.html',
  styleUrl: './sign-out.component.scss',
})
export class SignOutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  signOut() {
    this.authService.signOut().subscribe(
      () => {
        console.log('successful sign out');
        this.router.navigateByUrl('/sign-in');
      },
      () => {
        console.log('error during signing out');
      }
    );
  }
}
