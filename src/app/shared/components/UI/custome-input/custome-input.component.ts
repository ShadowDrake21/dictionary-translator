import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';

type InputType = 'text' | 'email' | 'password';

@Component({
  selector: 'ui-custome-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomeInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CustomeInputComponent),
      multi: true,
    },
  ],
  templateUrl: './custome-input.component.html',
  styleUrl: './custome-input.component.scss',
})
export class CustomeInputComponent implements ControlValueAccessor, Validator {
  @Input() placeholder: string = '';
  @Input() type: InputType = 'text';
  @Input() widthValue: string = '27.33%';
  @Input() isError: boolean = false;

  @Output() inputChange: EventEmitter<string> = new EventEmitter<string>();

  value: string = '';
  disabled = false;
  onChange: any = (value: any) => {};
  onTouched: any = () => {};

  onInputChange(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.value = inputValue;
    this.onChange(inputValue);
    this.onTouched();
    this.inputChange.emit(inputValue);
  }

  writeValue(value: any): void {
    this.value = value;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value === '') {
      return { required: true };
    }
    return null;
  }
}
