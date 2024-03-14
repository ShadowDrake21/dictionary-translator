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
  Subject,
  catchError,
  debounceTime,
  distinct,
  distinctUntilChanged,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { User } from '@firebase/auth';

import { IDictionaryWord } from '../../shared/models/dictionaty.model';
import { DictionaryService } from '../../core/services/dictionary.service';
import { CustomeInputComponent } from '../../shared/components/UI/custome-input/custome-input.component';
import { CustomBtnComponent } from '../../shared/components/UI/custom-btn/custom-btn.component';
import { DatabaseManipulationsService } from '../../core/services/database-manipulations.service';
import { AuthService } from '../../core/authentication/auth.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

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
  templateUrl: './dictionary.component.html',
  styleUrl: './dictionary.component.scss',
})
export class DictionaryComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private dictionaryService = inject(DictionaryService);
  private databaseManipulationsService = inject(DatabaseManipulationsService);

  dictionaryForm = new FormGroup({
    word: new FormControl('', Validators.required),
  });

  user$$ = new BehaviorSubject<User | null>(null);
  destroy$$ = new Subject<void>();

  words$$ = new BehaviorSubject<IDictionaryWord[]>([]);
  favourites$$ = new BehaviorSubject<string[]>([]);
  error$$ = new BehaviorSubject<string | null>(null);

  ngOnInit(): void {
    this.authService.user$.pipe(takeUntil(this.destroy$$)).subscribe((user) => {
      if (user) {
        this.user$$.next(user);
        this.getDictionaryWords(user.uid);
      } else {
        this.cleartUserData();
      }
    });
    console.log('favourites$', this.favourites$$);
  }

  onInputChange(value: string) {
    this.onInput();
  }

  onInput() {
    this.error$$.next(null);
    if (this.dictionaryForm.value.word) {
      this.fetchWordData();
      return;
    }

    this.words$$.next([]);
  }

  getDictionaryWords(userUid: string): void {
    this.databaseManipulationsService
      .getDictionaryWords(userUid)
      .subscribe((result: string[] | null) => {
        if (result) {
          this.favourites$$.next(result);
          console.log(this.favourites$$.getValue());
        }
      });
  }

  fetchWordData() {
    this.dictionaryForm
      .get('word')!
      .valueChanges.pipe(
        debounceTime(700),
        distinctUntilChanged(),
        switchMap((searchTerm: string | null) => {
          if (searchTerm) {
            return this.dictionaryService.getWords(searchTerm || '').pipe(
              catchError((error) => {
                this.error$$.next(
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
      .subscribe(
        (words: IDictionaryWord[]) => this.words$$.next([...words]),
        () => console.log('Completed')
      );
  }

  onAddToFavs() {
    this.words$$
      .pipe(
        map((words) => words.map((word) => word.word)),
        distinct(),
        tap((wordNames) => {
          const uniqueWords = [
            ...new Set([...this.favourites$$.getValue(), ...wordNames]),
          ];
          this.favourites$$.next(uniqueWords);
          this.databaseManipulationsService
            .writeDictionaryWord(this.user$$.getValue()?.uid, wordNames[0])
            .subscribe(() => {
              console.log('word added');
            });
          console.log(this.favourites$$.getValue());
        }),
        take(1)
      )
      .subscribe();
  }

  onClearAllFavs() {
    this.favourites$$.next([]);
    this.databaseManipulationsService
      .deleteFullUserDictionary(this.user$$.getValue()?.uid)
      .subscribe(() => console.log('all words deleted'));
    console.log(this.favourites$$.getValue());
  }

  cleartUserData(): void {
    this.words$$.next([]);
    this.favourites$$.next([]);
    this.error$$.next(null);
  }

  ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }
}
