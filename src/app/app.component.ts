import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';

import { FooterComponent } from './shared/components/footer/footer.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { filter, map, mergeMap } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FooterComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private router = inject(Router);

  pageIdentificator: string = '';

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.router.routerState.root),
        map((root: any) => {
          let route = root;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter((route: any) => route.outlet === 'primary'),
        mergeMap((route: any) => route.url),
        map((segments: any) => segments.map((segment: any) => segment.path))
      )
      .subscribe((paths: string[]) => {
        this.pageIdentificator = paths.join('/');
      });
  }
}
