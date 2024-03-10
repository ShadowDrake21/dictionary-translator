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

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomeInputComponent],
  templateUrl: './dictionary.component.html',
  styleUrl: './dictionary.component.scss',
})
export class DictionaryComponent {
  private dictionaryService = inject(DictionaryService);

  dictionaryForm = new FormGroup({
    word: new FormControl('', Validators.required),
  });

  words$ = new BehaviorSubject<IDictionaryWord[]>([]);
  favourites$ = new BehaviorSubject<string[]>([]);
  error$ = new BehaviorSubject<string | null>(null);

  onInputChange(value: string) {
    this.onInput();
  }

  onInput() {
    this.error$.next(null);
    if (this.dictionaryForm.value.word) {
      this.fetchWordData();
      return;
    }

    this.words$.next([]);
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
                this.error$.next(
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
        (words: IDictionaryWord[]) => this.words$.next([...words]),
        () => console.log('Completed')
      );
  }

  onAddToFavs() {
    this.words$
      .pipe(
        map((words) => words.map((word) => word.word)),
        distinct(),
        tap((wordNames) => {
          this.favourites$.next([...this.favourites$.getValue(), ...wordNames]);
        }),
        take(1)
      )
      .subscribe();
    this.favourites$.subscribe((words) => {
      console.log(words);
    });
  }
}
