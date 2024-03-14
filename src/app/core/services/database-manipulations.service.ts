import { Injectable } from '@angular/core';
import {
  Database,
  child,
  get,
  getDatabase,
  ref,
  remove,
  set,
} from 'firebase/database';
import { Observable, catchError, from, map } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class DatabaseManipulationsService {
  private database: Database = getDatabase();

  writeDictionaryWord(
    userUid: string | undefined,
    word: string
  ): Observable<void> {
    return from(
      set(ref(this.database, `dictionary/${userUid}/words/${word}`), {
        word,
      })
    ).pipe(
      catchError((error) => {
        console.log(error);
        throw error;
      })
    );
  }

  getDictionaryWords(userUid: string | undefined): Observable<string[] | null> {
    const databaseRef = ref(this.database);
    return from(get(child(databaseRef, `dictionary/${userUid}/words`))).pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          const values: string[] = Object.values(snapshot.val()).map(
            (entry: any) => entry.word
          );
          return values;
        } else {
          return null;
        }
      }),
      catchError((error) => {
        console.error(error);
        throw error;
      })
    );
  }

  deleteDictionaryWord(userUid: string, word: string): Observable<void> {
    return from(
      remove(ref(this.database, `dictionary/${userUid}/words/${word}`))
    ).pipe(
      catchError((error) => {
        console.log(error);
        throw error;
      })
    );
  }

  deleteFullUserDictionary(userUid: string | undefined): Observable<void> {
    return from(remove(ref(this.database, `dictionary/${userUid}`))).pipe(
      catchError((error) => {
        console.log(error);
        throw error;
      })
    );
  }
}
