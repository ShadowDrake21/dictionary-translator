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
@Injectable({
  providedIn: 'root',
})
export class DatabaseManipulationsService {
  private database: Database = getDatabase();

  writeDictionaryWord(userUid: string, word: string) {
    set(ref(this.database, `dictionary/${userUid}/words/${word}`), {
      word,
    });
  }

  getDictionaryWords(userUid: string) {
    const databaseRef = ref(this.database);
    get(child(databaseRef, `dictionary/${userUid}/words`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
        } else {
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  deleteDictionaryWord(userUid: string, word: string) {
    remove(ref(this.database, `dictionary/${userUid}/words/${word}`));
  }

  deleteFullUserDictionary(userUid: string) {
    remove(ref(this.database, `dictionary/${userUid}`));
  }
}
