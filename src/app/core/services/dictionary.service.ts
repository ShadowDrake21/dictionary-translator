import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';

import { IDictionaryWord } from '../../shared/models/dictionaty.model';
import { DICTIONARY_BASE_URL } from '../constants/dictionary.constants';
import { DatabaseManipulationsService } from './database-manipulations.service';
import { AuthService } from '../authentication/auth.service';
import { User } from '@firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class DictionaryService {
  private http = inject(HttpClient);

  public getWords(word: string): Observable<IDictionaryWord[]> {
    return this.http.get<IDictionaryWord[]>(DICTIONARY_BASE_URL + word);
  }
}
