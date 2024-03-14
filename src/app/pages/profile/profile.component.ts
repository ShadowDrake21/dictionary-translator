import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { BehaviorSubject, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { User } from '@firebase/auth';
import { Router } from '@angular/router';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { HeaderComponent } from '../../shared/components/header/header.component';
import { AuthService } from '../../core/authentication/auth.service';
import { DatabaseManipulationsService } from '../../core/services/database-manipulations.service';
import { CustomBtnComponent } from '../../shared/components/UI/custom-btn/custom-btn.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FaIconComponent, CustomBtnComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private databaseManipulationsService = inject(DatabaseManipulationsService);
  private router = inject(Router);

  faClose = faClose;

  userUid: string | undefined = undefined;

  user$$ = new BehaviorSubject<User | null>(null);
  destroy$$ = new Subject<void>();

  favourites$$ = new BehaviorSubject<string[]>([]);
  error$$ = new BehaviorSubject<string | null>(null);

  ngOnInit(): void {
    this.authService.user$.pipe(takeUntil(this.destroy$$)).subscribe((user) => {
      if (user) {
        this.userUid = user.uid;
        this.user$$.next(user);
        this.getDictionaryWords();
      } else {
        this.cleartUserData();
      }
    });
  }

  getDictionaryWords(): void {
    this.databaseManipulationsService
      .getDictionaryWords(this.userUid)
      .subscribe((result: string[] | null) => {
        if (result) {
          this.favourites$$.next(result);
          console.log(this.favourites$$.getValue());
        }
      });
  }

  // LAST ITEM AND UI
  onClearFav(word: string) {
    this.databaseManipulationsService
      .deleteDictionaryWord(this.userUid, word)
      .pipe(
        switchMap(() => {
          return this.databaseManipulationsService.getDictionaryWords(
            this.userUid
          );
        }),
        tap((updatedFavourites: string[] | null) => {
          if (updatedFavourites) {
            const filteredFavourites = updatedFavourites.filter(
              (fav) => fav !== word
            );
            this.favourites$$.next(filteredFavourites);
          } else {
            this.favourites$$.next([]);
          }
        })
      )
      .subscribe(() => {
        console.log(`word ${word} deleted`);
      });
  }

  onNavigateByWord(word: string) {
    console.log('onNavigateByWord', word);
    this.router.navigateByUrl('/dictionary');
  }

  onClearAllFavs() {
    this.favourites$$.next([]);
    this.databaseManipulationsService
      .deleteFullUserDictionary(this.userUid)
      .subscribe(() => console.log('all words deleted'));
    console.log(this.favourites$$.getValue());
  }

  cleartUserData(): void {
    this.favourites$$.next([]);
    this.error$$.next(null);
  }

  ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }
}
