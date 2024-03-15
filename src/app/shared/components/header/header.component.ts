import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faHome } from '@fortawesome/free-solid-svg-icons';

import { SignOutComponent } from '../sign-out/sign-out.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SignOutComponent, RouterModule, FontAwesomeModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);

  faUser = faUser;
  faHome = faHome;
  pageIdentificator: string = '';

  ngOnInit(): void {
    this.getPageIdentificator();
  }

  getPageIdentificator() {
    this.pageIdentificator = this.activatedRoute.snapshot.url[0].path;
  }
}
