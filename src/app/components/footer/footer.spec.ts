import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Footer } from './footer';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('Footer Component', () => {
  let fixture: ComponentFixture<Footer>;
  let component: Footer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [
        provideRouter([
          { path: 'contact', component: Footer }, // mock route for test
          { path: 'legal-mentions', component: Footer },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render contact and legal links', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));
    expect(links.length).toBe(2);
    expect(links[0].nativeElement.getAttribute('href')).toBe('/contact');
    expect(links[1].nativeElement.getAttribute('href')).toBe('/legal-mentions');
  });

  it('should render footer text', () => {
    const p = fixture.debugElement.query(By.css('p')).nativeElement;
    expect(p.textContent).toContain('EcoRide © 2025 - tous droits réservés.');
  });
});
