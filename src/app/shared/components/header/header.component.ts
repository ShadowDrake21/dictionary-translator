import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
export class HeaderComponent {
  @Input({ alias: 'identificator' }) pageIdentificator: string = '';

  faUser = faUser;
  faHome = faHome;
}
