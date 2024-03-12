import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ui-google-btn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './google-btn.component.html',
  styleUrl: './google-btn.component.scss',
})
export class GoogleBtnComponent {
  @Output() onSignIn = new EventEmitter<void>();
}
