import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegalMentions } from './legal-mentions';
import { BigTitle } from '../../components/big-title/big-title';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('LegalMentions', () => {
  let fixture: ComponentFixture<LegalMentions>;
  let component: LegalMentions;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalMentions, BigTitle],
      providers: [provideRouter([{ path: 'contact', component: LegalMentions }])],
    }).compileComponents();

    fixture = TestBed.createComponent(LegalMentions);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the main title', () => {
    const h2 = fixture.debugElement.query(By.css('.headline-container h2'))?.nativeElement;
    expect(h2?.textContent).toContain('Mentions Légales');
  });

  it('should contain a contact link', () => {
    const linkDebugEl = fixture.debugElement
      .queryAll(By.css('a'))
      .find((el) => el.nativeElement.textContent.includes('Contact'));

    expect(linkDebugEl).toBeTruthy();
    expect(linkDebugEl?.nativeElement.getAttribute('href')).toBeDefined();
  });

  it('should render all section headers', () => {
    const sectionHeaders = fixture.debugElement.queryAll(By.css('.legal-container .section h2'));
    const expectedHeaders = [
      "Éditeur de l'application",
      'Hébergement',
      'Propriété intellectuelle',
      'Collecte et protection des données personnelles',
      'Paiements',
      'Responsabilité',
      'Cookies et technologies similaires',
      'Caractère éducatif et avertissement',
      'Modification des mentions légales',
    ];
    const headersText = sectionHeaders.map((h) => h.nativeElement.textContent.trim());
    expect(headersText).toEqual(expectedHeaders);
  });
});
