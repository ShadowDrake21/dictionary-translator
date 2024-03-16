import { Injectable, inject } from '@angular/core';
import { AuthService } from '../authentication/auth.service';
import { DatabaseManipulationsService } from './database-manipulations.service';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { IDictionaryWord } from '../../shared/models/dictionaty.model';
import { User } from '@firebase/auth';
import { IMessage } from '../../shared/models/message.model';

@Injectable()
export class MutualDictionaryProfileService {
  private authService = inject(AuthService);
  private databaseManipulationsService = inject(DatabaseManipulationsService);

  userUid: string | undefined = undefined;

  user$$ = new BehaviorSubject<User | null>(null);
  destroy$$ = new Subject<void>();

  words$$ = new BehaviorSubject<IDictionaryWord[]>([]);
  favourites$$ = new BehaviorSubject<string[]>([]);
  error$$ = new BehaviorSubject<string | null>(null);

  message$$: BehaviorSubject<IMessage | null> =
    new BehaviorSubject<IMessage | null>(null);

  public getUserAndPerformActions(): void {
    this.authService.user$.pipe(takeUntil(this.destroy$$)).subscribe((user) => {
      if (user) {
        this.userUid = user.uid;
        this.user$$.next(user);
        this.getDictionaryWords();
      } else {
        this.clearUserData();
      }
    });
  }

  getDictionaryWords(): void {
    this.databaseManipulationsService
      .getDictionaryWords(this.userUid)
      .subscribe((result: string[] | null) => {
        if (result) {
          this.favourites$$.next(result);
        }
      });
  }

  onClearAllFavs() {
    this.favourites$$.next([]);
    this.databaseManipulationsService
      .deleteFullUserDictionary(this.userUid)
      .subscribe(() => {
        this.message$$.next({ type: 'delete', text: 'all words deleted' });
        setTimeout(() => {
          this.message$$.next(null);
        }, 3000);
      });
  }

  clearUserData(): void {
    this.words$$.next([]);
    this.favourites$$.next([]);
    this.error$$.next(null);
  }
}
