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
  filter,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';

import { IDictionaryWord } from '../../shared/models/dictionaty.model';
import { DictionaryService } from '../../core/services/dictionary.service';
import { CustomeInputComponent } from '../../shared/components/UI/custome-input/custome-input.component';
import { CustomBtnComponent } from '../../shared/components/UI/custom-btn/custom-btn.component';

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomeInputComponent,
    CustomBtnComponent,
  ],
  templateUrl: './dictionary.component.html',
  styleUrl: './dictionary.component.scss',
})
export class DictionaryComponent implements OnInit {
  private dictionaryService = inject(DictionaryService);

  dictionaryForm = new FormGroup({
    word: new FormControl('', Validators.required),
  });

  words$$ = new BehaviorSubject<IDictionaryWord[]>([]);
  favourites$$ = new BehaviorSubject<string[]>([]);
  error$$ = new BehaviorSubject<string | null>(null);

  ngOnInit(): void {
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
          console.log(this.favourites$$.getValue());
        }),
        take(1)
      )
      .subscribe();
  }

  onClearFavs() {
    this.favourites$$.next([]);
    console.log(this.favourites$$.getValue());
  }
}
