import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBar } from './search-bar';
import { provideRouter, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { Results } from '../../pages/results/results';
import { FormsModule } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

describe('SearchBar', () => {
  let fixture: ComponentFixture<SearchBar>;
  let component: SearchBar;
  const routes: Routes = [{ path: 'results', component: Results }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBar, Results, FormsModule],
      providers: [provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function resetSearchBar() {
    component.originCity = '';
    component.destinyCity = '';
    component.date = null;
    component.errorOrigin = '';
    component.errorDestiny = '';
    component.errorDate = '';
    fixture.detectChanges();
  }

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render formulaire', () => {
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

  it('should have correct placeholders and required attributes', () => {
    const originInput = fixture.nativeElement.querySelector('input[name="originCity"]');
    const destinyInput = fixture.nativeElement.querySelector('input[name="destinyCity"]');
    const dateInput = fixture.nativeElement.querySelector('input[name="date"]');

    expect(originInput.placeholder).toBe('Ville de départ');
    expect(destinyInput.placeholder).toBe("Ville d'arrivée");
    expect(dateInput.placeholder).toBe('jj/mm/aaaa');

    expect(originInput.required).toBeTruthy();
    expect(destinyInput.required).toBeTruthy();
    expect(dateInput.required).toBeTruthy();
  });

  it('should render button Recherche', () => {
    const button = fixture.nativeElement.querySelector('button.search-btn');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Recherche');
  });

  it('should navigate to results page on valid submit', async () => {
    resetSearchBar();
    const harness = await RouterTestingHarness.create();

    const originInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[name="originCity"]'
    );
    const destinyInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[name="destinyCity"]'
    );
    const dateInput: HTMLInputElement = fixture.nativeElement.querySelector('input[name="date"]');

    originInput.value = 'Paris';
    originInput.dispatchEvent(new Event('input'));
    destinyInput.value = 'Lyon';
    destinyInput.dispatchEvent(new Event('input'));

    const validDate: NgbDateStruct = { year: 2025, month: 12, day: 25 };
    dateInput.value = `${validDate.day}/${validDate.month}/${validDate.year}`;
    dateInput.dispatchEvent(new Event('input'));
    component.date = validDate;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button.search-btn');
    button.click();

    await harness.navigateByUrl('/results', Results);
    const routedNativeElement = await harness.routeNativeElement;
    expect(routedNativeElement).not.toBeNull();
    expect(routedNativeElement!.textContent).toContain('results works!');
  });

  it('should show errors if inputs are invalid', () => {
    resetSearchBar();

    const originInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[name="originCity"]'
    );
    const destinyInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[name="destinyCity"]'
    );
    const dateInput: HTMLInputElement = fixture.nativeElement.querySelector('input[name="date"]');

    originInput.value = '659';
    originInput.dispatchEvent(new Event('input'));
    destinyInput.value = '-*/';
    destinyInput.dispatchEvent(new Event('input'));
    dateInput.value = 'dafdfe';
    dateInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('small.error');
    expect(errors.length).toBe(3);
  });

  it('should show error if originCity is empty but other fields filled', () => {
    resetSearchBar();
    const originInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[name="originCity"]'
    );
    const destinyInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[name="destinyCity"]'
    );
    const dateInput: HTMLInputElement = fixture.nativeElement.querySelector('input[name="date"]');

    destinyInput.value = 'Lyon';
    destinyInput.dispatchEvent(new Event('input'));

    const validDate: NgbDateStruct = { year: 2025, month: 12, day: 25 };
    dateInput.value = `25/12/2025`;
    dateInput.dispatchEvent(new Event('input'));

    component.date = validDate;

    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('small.error');
    expect(errors.length).toBe(1);
  });

  it('should show error if destinyCity is empty but other fields filled', () => {
    resetSearchBar();
    const originInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[name="originCity"]'
    );
    const destinyInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[name="destinyCity"]'
    );
    const dateInput: HTMLInputElement = fixture.nativeElement.querySelector('input[name="date"]');

    originInput.value = 'Paris';
    originInput.dispatchEvent(new Event('input'));

    const validDate: NgbDateStruct = { year: 2025, month: 12, day: 25 };
    dateInput.value = `25/12/2025`;
    dateInput.dispatchEvent(new Event('input'));

    component.date = validDate;

    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('small.error');
    expect(errors.length).toBe(1);
  });

  it('should show error if date is empty but other fields filled', () => {
    resetSearchBar();

    const originInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[name="originCity"]'
    );
    const destinyInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[name="destinyCity"]'
    );

    originInput.value = 'Paris';
    originInput.dispatchEvent(new Event('input'));
    destinyInput.value = 'Lyon';
    destinyInput.dispatchEvent(new Event('input'));

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

    const button = fixture.nativeElement.querySelector('button.search-btn');
    button.click();

    const routedNativeElement = await harness.routeNativeElement;
    expect(routedNativeElement).toBeNull();
  });
});
