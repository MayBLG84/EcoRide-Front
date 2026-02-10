import { Component } from '@angular/core';
import { SearchBar } from '../../components/search-bar/search-bar';

@Component({
  selector: 'app-home',
  imports: [SearchBar],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  standalone: true,
})
export class Home {}
