import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { DictionaryComponent } from './pages/dictionary/dictionary.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/sign-in' },
  {
    path: 'sign-in',
    component: SignInComponent,
  },
  {
    path: 'dictionary',
    component: DictionaryComponent,
    // loadChildren: () =>
    //   import('./pages/translate/translate.component').then(
    //     (m) => m.TranslateComponent
    //   ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  { path: '**', component: PageNotFoundComponent },
];
