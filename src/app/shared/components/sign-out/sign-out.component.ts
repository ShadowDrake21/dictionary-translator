import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/authentication/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'auth-sign-out',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sign-out.component.html',
  styleUrl: './sign-out.component.scss',
})
export class SignOutComponent {
  private authService = inject(AuthService);

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
