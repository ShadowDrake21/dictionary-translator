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
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

import { IDictionaryWord } from '../../shared/models/dictionaty.model';
import { DictionaryService } from '../../core/services/dictionary.service';
import { CustomeInputComponent } from '../../shared/components/UI/custome-input/custome-input.component';

@Component({
  selector: 'app-translate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomeInputComponent],
  templateUrl: './translate.component.html',
  styleUrl: './translate.component.scss',
})
export class TranslateComponent implements OnInit, OnDestroy {
  private dictionaryService = inject(DictionaryService);

  translateForm = new FormGroup({
    word: new FormControl('', Validators.required),
  });

  words$ = new BehaviorSubject<IDictionaryWord[]>([]);
  error$ = new BehaviorSubject<string | null>(null);

  ngOnInit(): void {
    // this.fetchWordData();
  }

  onInputChange(value: string) {
    this.onInput();
  }

  onInput() {
    this.error$.next(null);
    if (this.translateForm.value.word) {
      this.fetchWordData();
      return;
    }

    this.words$.next([]);
  }

  fetchWordData() {
    this.translateForm
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

  ngOnDestroy(): void {}
}
