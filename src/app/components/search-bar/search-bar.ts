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

  onSearch() {
    // Reset error messages
    this.errorOrigin = '';
    this.errorDestiny = '';
    this.errorDate = '';
    this.errorGeneral = '';

    let valid = true;

    if (!this.validation.isValidCity(this.originCity)) {
      this.errorOrigin = 'Ville invalide.';
      valid = false;
    }

    if (!this.validation.isValidCity(this.destinyCity)) {
      this.errorDestiny = 'Ville invalide.';
      valid = false;
    }

    if (!this.validation.isValidDate(this.date)) {
      this.errorDate = 'Veuillez sélectionner une date valide.';
      valid = false;
    }

    if (!valid) {
      this.errorGeneral = 'Tous les champs doivent être remplis.';
      return;
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
}
