import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  catchError,
  debounceTime,
  delay,
  distinct,
  distinctUntilChanged,
  finalize,
  map,
  of,
  share,
  shareReplay,
  startWith,
  switchMap,
  take,
  takeLast,
  takeUntil,
  tap,
  timer,
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { IDictionaryWord } from '../../shared/models/dictionaty.model';
import { DictionaryService } from '../../core/services/dictionary.service';
import { CustomeInputComponent } from '../../shared/components/UI/custome-input/custome-input.component';
import { CustomBtnComponent } from '../../shared/components/UI/custom-btn/custom-btn.component';
import { DatabaseManipulationsService } from '../../core/services/database-manipulations.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { MutualDictionaryProfileService } from '../../core/services/mutual-dictionary-profile.service';

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomeInputComponent,
    CustomBtnComponent,
    HeaderComponent,
  ],
  providers: [MutualDictionaryProfileService],
  templateUrl: './dictionary.component.html',
  styleUrl: './dictionary.component.scss',
})
export class DictionaryComponent implements OnInit, OnDestroy {
  protected dictionaryService = inject(DictionaryService);
  protected mutualDictionaryProfile = inject(MutualDictionaryProfileService);
  private databaseManipulationsService = inject(DatabaseManipulationsService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  dictionaryForm = new FormGroup({
    word: new FormControl('', Validators.required),
  });

  isFavourite$: Observable<boolean> | null = null;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.getQueryParams();
    this.mutualDictionaryProfile.getUserAndPerformActions();

    this.fetchWordData();
  }

  getQueryParams() {
    this.activatedRoute.queryParams
      .pipe(
        tap(() => this.mutualDictionaryProfile.words$$.next([])),
        takeUntil(this.mutualDictionaryProfile.destroy$$)
      )
      .subscribe((word: object) => {
        if (word && Object.keys(word).length > 0) {
          const queryValue = Object.values(word).toString();
          this.dictionaryForm.controls.word.setValue(queryValue);
          this.fetchWordData();
          this.clearQueryParams();
        }
      });
  }

  clearQueryParams() {
    this.router.navigate([], {
      queryParams: {
        word: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  onInputChange(value: string) {
    this.onInput();
  }

  onInput() {
    this.mutualDictionaryProfile.error$$.next(null);
    if (this.dictionaryForm.value.word) {
      return;
    }

    this.mutualDictionaryProfile.words$$.next([]);
  }

  fetchWordData() {
    const fetchWordDataSubscription = this.dictionaryForm
      .get('word')!
      .valueChanges.pipe(
        debounceTime(700),
        distinctUntilChanged(),
        switchMap((searchTerm: string | null) => {
          if (searchTerm) {
            return this.dictionaryService.getWords(searchTerm || '').pipe(
              catchError((error) => {
                this.mutualDictionaryProfile.error$$.next(
                  `Sorry pal, there is no such word. More about an error: ${error.message}`
                );
                return [];
              })
            );
          } else {
            return [];
          }
        })
      )
      .subscribe((words: IDictionaryWord[]) => {
        this.mutualDictionaryProfile.words$$.next([...words]);
        const wordArr = this.mutualDictionaryProfile.words$$.getValue();
        this.isFavourite$ = this.markBtnFavAsHidden(wordArr[0]);
      });

    this.subscriptions.push(fetchWordDataSubscription);
  }

  onAddToFavs() {
    const addWordSubscription = this.mutualDictionaryProfile.words$$
      .pipe(
        map((words) => words.map((word) => word.word)),
        distinct(),
        tap((wordNames) => {
          const uniqueWords = [
            ...new Set([
              ...this.mutualDictionaryProfile.favourites$$.getValue(),
              ...wordNames,
            ]),
          ];
          this.mutualDictionaryProfile.favourites$$.next(uniqueWords);
          this.databaseManipulationsService
            .writeDictionaryWord(
              this.mutualDictionaryProfile.user$$.getValue()?.uid,
              wordNames[0]
            )
            .subscribe(() => {
              this.mutualDictionaryProfile.message$$.next({
                type: 'add',
                text: 'word added',
              });
              setTimeout(() => {
                this.mutualDictionaryProfile.message$$.next(null);
              }, 3000);
            });
        }),
        take(1)
      )
      .subscribe();

    this.subscriptions.push(addWordSubscription);
  }

  markBtnFavAsHidden(
    wordEl: IDictionaryWord | null
  ): Observable<boolean> | null {
    if (!wordEl) return null;
    const { word } = wordEl;

    return this.mutualDictionaryProfile.favourites$$.pipe(
      map((favourites) => {
        return favourites.includes(word);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.mutualDictionaryProfile.destroy$$.next();
    this.mutualDictionaryProfile.destroy$$.complete();
  }
}
