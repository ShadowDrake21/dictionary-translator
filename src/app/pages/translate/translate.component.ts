import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import { DictionaryService } from '../../core/services/dictionary.service';
import {
  BehaviorSubject,
  Subject,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
} from 'rxjs';
import {
  Definition,
  IDictionaryWord,
  License,
  Meaning,
  Phonetic,
} from '../../shared/models/dictionaty.model';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-translate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './translate.component.html',
  styleUrl: './translate.component.scss',
})
export class TranslateComponent implements OnInit {
  private dictionaryService = inject(DictionaryService);

  translateForm = new FormGroup({
    word: new FormControl('', Validators.required),
  });

  words$ = new BehaviorSubject<IDictionaryWord[]>([]);

  ngOnInit(): void {
    // this.fetchWordData();
  }

  fetchWordData() {
    // this.dictionaryService.getWords('girlfriend').pipe(
    //   tap(word => console.log(word)),
    //   map((dicrionary: IDictionaryWord[]) =>
    //     dicrionary.map((word: IDictionaryWord) => {
    //       this.words$.next([...this.words$.getValue(), word]);
    //       console.log(this.words$);
    //     })
    //   )
    // );
    this.dictionaryService
      .getWords('girlfriend')
      .subscribe((words: IDictionaryWord[]) => {
        this.words$.next([...words]);
      });
  }

  onInput() {
    if (!this.translateForm.value.word) return;

    this.translateForm
      .get('word')!
      .valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchTerm: string | null) =>
          this.dictionaryService.getWords(searchTerm || '')
        )
      )
      .subscribe(
        (words: IDictionaryWord[]) => this.words$.next([...words]),
        (err) => console.log('Error: ', err),
        () => console.log('Completed')
      );
  }
}
