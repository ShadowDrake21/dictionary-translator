import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { DictionaryComponent } from './pages/dictionary/dictionary.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/sign-up' },
  {
    path: 'sign-up',
    component: SignUpComponent,
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
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
    path: 'communicate-with-ai',
    loadChildren: () =>
      import('./pages/communicate-with-ai/communicate-with-ai.component').then(
        (m) => m.CommunicateWithAiComponent
      ),
  },
  {
    path: 'communicate-with-ai',
    loadChildren: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  { path: '**', component: PageNotFoundComponent },
];
