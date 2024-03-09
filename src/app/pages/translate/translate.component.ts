import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import { DictionaryService } from '../../core/services/dictionary.service';
import { BehaviorSubject, Subject, map, tap } from 'rxjs';
import { IDictionaryWord } from '../../shared/models/dictionaty.model';

@Component({
  selector: 'app-translate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './translate.component.html',
  styleUrl: './translate.component.scss',
})
export class TranslateComponent implements OnInit {
  private DictionaryService = inject(DictionaryService);

  words = new BehaviorSubject<IDictionaryWord[]>([]);

  ngOnInit(): void {
    this.fetchWordData();
  }

  fetchWordData() {
    // this.DictionaryService.getWords('girlfriend').pipe(
    //   tap(word => console.log(word)),
    //   map((dicrionary: IDictionaryWord[]) =>
    //     dicrionary.map((word: IDictionaryWord) => {
    //       this.words.next([...this.words.getValue(), word]);
    //       console.log(this.words);
    //     })
    //   )
    // );
    this.DictionaryService.getWords('girlfriend').subscribe(
      (words: IDictionaryWord[]) => {
        this.words.next([...words]);
      }
    );
  }
}
