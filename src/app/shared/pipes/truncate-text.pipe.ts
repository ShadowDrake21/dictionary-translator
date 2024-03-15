import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateText',
  standalone: true,
})
export class TruncateTextPipe implements PipeTransform {
  transform(value: string, number: number): string {
    return value.slice(0, number) + '...';
  }
}
