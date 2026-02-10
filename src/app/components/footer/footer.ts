import { Component, signal } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, RouterModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  standalone: true,
})
export class Footer {}
