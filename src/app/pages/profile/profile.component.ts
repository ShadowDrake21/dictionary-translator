import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, map, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { HeaderComponent } from '../../shared/components/header/header.component';
import { DatabaseManipulationsService } from '../../core/services/database-manipulations.service';
import { CustomBtnComponent } from '../../shared/components/UI/custom-btn/custom-btn.component';
import { TruncateTextPipe } from '../../shared/pipes/truncate-text.pipe';
import { MutualDictionaryProfileService } from '../../core/services/mutual-dictionary-profile.service';

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
  providers: [MutualDictionaryProfileService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  protected mutualDictionaryProfile = inject(MutualDictionaryProfileService);
  private databaseManipulationsService = inject(DatabaseManipulationsService);
  private router = inject(Router);

  faClose = faClose;

  pageSize = 8;
  currentPage$$ = new BehaviorSubject<number>(1);

  ngOnInit(): void {
    this.mutualDictionaryProfile.getUserAndPerformActions();
  }

  visibleFavourites$$ = combineLatest([
    this.mutualDictionaryProfile.favourites$$,
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
    return Math.ceil(
      this.mutualDictionaryProfile.favourites$$.getValue().length /
        this.pageSize
    );
  }

  onClearFav(word: string) {
    this.databaseManipulationsService
      .deleteDictionaryWord(this.mutualDictionaryProfile.userUid, word)
      .pipe(
        switchMap(() => {
          return this.databaseManipulationsService.getDictionaryWords(
            this.mutualDictionaryProfile.userUid
          );
        }),
        tap((updatedFavourites: string[] | null) => {
          if (updatedFavourites) {
            const filteredFavourites = updatedFavourites.filter(
              (fav) => fav !== word
            );
            this.mutualDictionaryProfile.favourites$$.next(filteredFavourites);
          } else {
            this.mutualDictionaryProfile.favourites$$.next([]);
          }
        }),
        tap(() => {
          this.currentPage$$.next(1);
        })
      )
      .subscribe(() => {
        console.log(`word ${word} deleted`);
        this.mutualDictionaryProfile.message$$.next({
          type: 'delete',
          text: `word "${word}" deleted`,
        });
        setTimeout(() => {
          this.mutualDictionaryProfile.message$$.next(null);
        }, 3000);
      });
  }

  onNavigateByWord(word: string) {
    this.router.navigate(['/dictionary'], { queryParams: { word } });
  }

  ngOnDestroy(): void {
    this.mutualDictionaryProfile.destroy$$.next();
    this.mutualDictionaryProfile.destroy$$.complete();
  }
}
