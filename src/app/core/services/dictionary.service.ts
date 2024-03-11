import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { IDictionaryWord } from '../../shared/models/dictionaty.model';
import { DICTIONARY_BASE_URL } from '../constants/dictionary.constants';

@Injectable({
  providedIn: 'root',
})
export class DictionaryService {
  private http = inject(HttpClient);

  public getWords(word: string): Observable<IDictionaryWord[]> {
    return this.http.get<IDictionaryWord[]>(DICTIONARY_BASE_URL + word);
  }
}
