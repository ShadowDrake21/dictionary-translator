import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User } from '@firebase/auth';

import { AuthService } from '../../core/authentication/auth.service';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss',
})
export class PageNotFoundComponent implements OnInit {
  private authService = inject(AuthService);

  user$$ = new BehaviorSubject<User | null>(null);

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.user$$.next(user);
    });
  }
}
