import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ValidationService } from '../../services/validation';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, NgbDatepickerModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.scss'],
})
export class SearchBar {
  originCity: string = '';
  destinyCity: string = '';
  date: NgbDateStruct | null = null;
  errorOrigin = '';
  errorDestiny = '';
  errorDate = '';
  errorGeneral = '';

  // Regex to accept letters (uppercase/lowercase), spaces, and French accents
  cityPattern: RegExp = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;

  constructor(private router: Router, private validation: ValidationService) {}

  onSearch(): void {
    this.clearErrors();

    const originValid = this.validation.isValidCity(this.originCity);
    const destinyValid = this.validation.isValidCity(this.destinyCity);
    const dateValid = this.validation.isValidDate(this.date);

    if (!originValid) this.errorOrigin = 'Ville invalide.';
    if (!destinyValid) this.errorDestiny = 'Ville invalide.';
    if (!dateValid) this.errorDate = 'Veuillez sélectionner une date valide.';

    if (!originValid || !destinyValid || !dateValid) {
      return; // já mostra erros, não precisa errorGeneral
    }

    const jsDate = this.validation.toJsDate(this.date!);

    this.router.navigate(['/results'], {
      queryParams: {
        origin: this.originCity,
        destiny: this.destinyCity,
        date: jsDate.toISOString(),
      },
    });
  }

  private clearErrors() {
    this.errorOrigin = '';
    this.errorDestiny = '';
    this.errorDate = '';
    this.errorGeneral = '';
  }
}
