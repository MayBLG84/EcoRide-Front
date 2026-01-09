import { Component, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs/operators';
import { ValidationService } from '../../services/validation';
import { City, CityService } from '../../services/city';
import { SearchStateService } from '../../services/search-state';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule, NgbDatepickerModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.scss'],
})
export class SearchBar implements OnDestroy {
  form: FormGroup;

  // Error messages displayed below fields
  errorOrigin = '';
  errorDestiny = '';
  errorDate = '';

  // Autocomplete lists
  originSuggestions: City[] = [];
  destinySuggestions: City[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private searchState: SearchStateService,
    public validation: ValidationService,
    private cityService: CityService
  ) {
    // Reactive form without built-in Angular validators
    // because validation is handled by ValidationService
    this.form = this.fb.group({
      originCity: [''],
      destinyCity: [''],
      date: [null], // NgbDateStruct
    });
    this.initAutocomplete();
  }

  private initAutocomplete(): void {
    // Origin city autocomplete
    this.form
      .get('originCity')!
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((value) => typeof value === 'string' && value.length >= 3),
        switchMap((value) => this.cityService.searchCities(value)),
        takeUntil(this.destroy$)
      )
      .subscribe((cities) => {
        this.originSuggestions = cities;
      });

    // Destiny city autocomplete
    this.form
      .get('destinyCity')!
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((value) => typeof value === 'string' && value.length >= 3),
        switchMap((value) => this.cityService.searchCities(value)),
        takeUntil(this.destroy$)
      )
      .subscribe((cities) => {
        this.destinySuggestions = cities;
      });
  }

  selectOrigin(city: City): void {
    this.form.patchValue({ originCity: city.nom });
    this.originSuggestions = [];
  }

  selectDestiny(city: City): void {
    this.form.patchValue({ destinyCity: city.nom });
    this.destinySuggestions = [];
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

    // Store search state centrally
    this.searchState.setBaseSearch({
      originCity,
      destinyCity,
      date: {
        year: date.year,
        month: date.month,
        day: date.day,
      },
    });

    // Navigate to results page
    this.router.navigate(['/results']);
  }

  private clearErrors() {
    // Reset all displayed error messages
    this.errorOrigin = '';
    this.errorDestiny = '';
    this.errorDate = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
