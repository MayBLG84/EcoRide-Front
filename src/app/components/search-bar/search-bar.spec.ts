import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Routes, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchBar } from './search-bar';
import { Results } from '../../pages/results/results';
import { CityService } from '../../services/city';
import { of } from 'rxjs';

class MockCityService {
  searchCities() {
    return of([]);
  }
}

describe('SearchBar', () => {
  let fixture: ComponentFixture<SearchBar>;
  let component: SearchBar;
  const routes: Routes = [{ path: 'results', component: Results }];
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBar, ReactiveFormsModule],
      providers: [provideRouter([]), { provide: CityService, useClass: MockCityService }],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBar);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
  });

  function resetSearchBar() {
    component.form.reset();
    component.errorOrigin = '';
    component.errorDestiny = '';
    component.errorDate = '';
    fixture.detectChanges();
  }

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render form', () => {
    const form = fixture.nativeElement.querySelector('form');
    expect(form).toBeTruthy();
  });

  it('should render input icons', () => {
    const originIcon = fixture.nativeElement.querySelector('.field .bi-geo-alt-fill');
    const destinyIcon = fixture.nativeElement.querySelector('.field .bi-flag-fill');
    const dateIcon = fixture.nativeElement.querySelector('.field .bi-calendar2-date-fill');

    expect(originIcon).toBeTruthy();
    expect(destinyIcon).toBeTruthy();
    expect(dateIcon).toBeTruthy();
  });

  it('should render button Recherche', () => {
    const button = fixture.nativeElement.querySelector('button.search-btn');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Recherche');
  });

  it('should navigate to results page on valid submit', () => {
    resetSearchBar();

    component.form.get('originCity')?.setValue('Paris');
    component.form.get('destinyCity')?.setValue('Lyon');
    component.form.get('date')?.setValue({ year: 2025, month: 12, day: 25 });

    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/results']);
  });

  it('should show errors if all inputs are invalid', () => {
    resetSearchBar();

    component.form.get('originCity')?.setValue('659');
    component.form.get('destinyCity')?.setValue('-*/');
    component.form.get('date')?.setValue(null);
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('small.error');
    expect(errors.length).toBe(3);
  });

  it('should show error if originCity is empty', () => {
    resetSearchBar();

    component.form.get('destinyCity')?.setValue('Lyon');
    component.form.get('date')?.setValue({ year: 2025, month: 12, day: 25 });
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('small.error');
    expect(errors.length).toBe(1);
  });

  it('should show error if destinyCity is empty', () => {
    resetSearchBar();

    component.form.get('originCity')?.setValue('Paris');
    component.form.get('date')?.setValue({ year: 2025, month: 12, day: 25 });
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('small.error');
    expect(errors.length).toBe(1);
  });

  it('should show error if date is empty', () => {
    resetSearchBar();

    component.form.get('originCity')?.setValue('Paris');
    component.form.get('destinyCity')?.setValue('Lyon');
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('small.error');
    expect(errors.length).toBe(1);
  });

  it('should not navigate if inputs are invalid', async () => {
    resetSearchBar();
    const harness = await RouterTestingHarness.create();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const routedNativeElement = await harness.routeNativeElement;
    expect(routedNativeElement).toBeNull();
  });
});
