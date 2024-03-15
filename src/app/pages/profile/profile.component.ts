import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { User } from '@firebase/auth';
import { Router } from '@angular/router';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { HeaderComponent } from '../../shared/components/header/header.component';
import { AuthService } from '../../core/authentication/auth.service';
import { DatabaseManipulationsService } from '../../core/services/database-manipulations.service';
import { CustomBtnComponent } from '../../shared/components/UI/custom-btn/custom-btn.component';
import { TruncateTextPipe } from '../../shared/pipes/truncate-text.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FaIconComponent,
    CustomBtnComponent,
    TruncateTextPipe,
  ],
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

  pageSize = 8;
  currentPage$$ = new BehaviorSubject<number>(1);

  ngOnInit(): void {
    this.authService.user$.pipe(takeUntil(this.destroy$$)).subscribe((user) => {
      if (user) {
        this.userUid = user.uid;
        this.user$$.next(user);
        console.log(user);
        this.getDictionaryWords();
      } else {
        this.cleartUserData();
      }
    });
  }

  visibleFavourites$$ = combineLatest([
    this.favourites$$,
    this.currentPage$$,
  ]).pipe(
    map(([favourites, currentPage]) => {
      const startIndex = (currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return favourites.slice(startIndex, endIndex);
    })
  );

  nextPage(): void {
    const currentPage = this.currentPage$$.getValue();
    if (currentPage < this.calcPageCount()) {
      this.currentPage$$.next(currentPage + 1);
    }
  }

  prevPage(): void {
    const currentPage = this.currentPage$$.getValue();
    if (currentPage > 1) {
      this.currentPage$$.next(currentPage - 1);
    }
  }

  calcPageCount(): number {
    return Math.ceil(this.favourites$$.getValue().length / this.pageSize);
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
        }),
        tap(() => {
          this.currentPage$$.next(1);
        })
      )
      .subscribe(() => {
        console.log(`word ${word} deleted`);
      });
  }

  onNavigateByWord(word: string) {
    console.log('onNavigateByWord', word);
    this.router.navigate(['/dictionary'], { queryParams: { word } });
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
