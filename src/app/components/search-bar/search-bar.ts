import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ValidationService } from '../../services/validation';
import { SearchService } from '../../services/search-ride';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule, NgbDatepickerModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.scss'],
})
export class SearchBar {
  form: FormGroup;

  // Error messages displayed below fields
  errorOrigin = '';
  errorDestiny = '';
  errorDate = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public validation: ValidationService,
    private searchService: SearchService
  ) {
    // Reactive form without built-in Angular validators
    // because validation is handled by ValidationService
    this.form = this.fb.group({
      originCity: [''],
      destinyCity: [''],
      date: [null], // NgbDateStruct
    });
  }

  onSearch(): void {
    this.form.markAllAsTouched();
    this.clearErrors();

    const { originCity, destinyCity, date } = this.form.value;

    // Validation handled by your custom validation service
    const originValid = this.validation.isValidCity(originCity);
    const destinyValid = this.validation.isValidCity(destinyCity);
    const dateValid = this.validation.isValidDate(date);

    // Assign error messages
    if (!originValid) this.errorOrigin = 'Ville invalide.';
    if (!destinyValid) this.errorDestiny = 'Ville invalide.';
    if (!dateValid) this.errorDate = 'Veuillez sélectionner une date valide.';

    // Stop form submission if any validation fails
    if (!originValid || !destinyValid || !dateValid) {
      return;
    }

    // Convert NgbDateStruct → ISO string using your validation helper
    const isoDate = this.validation.toJsDate(date).toISOString();

    // JSON payload sent to backend
    const payload = {
      originCity,
      destinyCity,
      date: isoDate,
    };

    // Send search request to backend API
    this.searchService.search(payload).subscribe({
      next: (results) => {
        // Navigate to /results and pass data through navigation state
        this.router.navigate(['/results'], { state: { results } });
      },
      error: (err) => {
        console.error('API Error: ', err);
      },
    });
  }

  private clearErrors() {
    // Reset all displayed error messages
    this.errorOrigin = '';
    this.errorDestiny = '';
    this.errorDate = '';
  }
}
