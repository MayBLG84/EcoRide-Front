import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-big-title',
  imports: [],
  templateUrl: './big-title.html',
  styleUrls: ['./big-title.scss'],
  standalone: true,
})
export class BigTitle {
  @Input() bigTitle!: string;
}
