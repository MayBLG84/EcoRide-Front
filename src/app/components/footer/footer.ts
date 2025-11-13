import { Component, signal } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  standalone: true,
})
export class Footer {}
