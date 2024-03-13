import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-custom-btn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-btn.component.html',
  styleUrl: './custom-btn.component.scss',
})
export class CustomBtnComponent {
  @Input({ required: true }) text?: string;
  @Input() color: string = '#0d6efd';
  @Input() width: string = '100%';
  @Output() onClick: EventEmitter<void> = new EventEmitter();
}
