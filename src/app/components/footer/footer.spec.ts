import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Footer } from './footer';
import { provideRouter, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { Contact } from '../../pages/contact/contact';
import { LegalMentions } from '../../pages/legal-mentions/legal-mentions';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    const routes: Routes = [
      { path: 'contact', component: Contact },
      { path: 'legal-mentions', component: LegalMentions },
    ];

    await TestBed.configureTestingModule({
      imports: [Footer, Contact, LegalMentions],
      providers: [provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
  });

  it('should create', () => {
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });

  it('should render contact and legal links', () => {
    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[0].textContent).toContain('Contact');
    expect(links[1].textContent).toContain('Mentions légales');
  });

  it('should render footer text', () => {
    const p = fixture.nativeElement.querySelector('p');
    expect(p.textContent).toContain('EcoRide © 2025');
  });

  it('should navigate to contact page on link click', async () => {
    const harness = await RouterTestingHarness.create();

    const contactLink = fixture.debugElement.queryAll(By.css('a'))[0].nativeElement;
    contactLink.click();

    await harness.navigateByUrl('/contact');

    const routedNativeElement = harness.routeNativeElement;
    expect(routedNativeElement).not.toBeNull();
    expect(routedNativeElement!.textContent).toContain('contact works!');
  });

  it('should navigate to legal mentions page on link click', async () => {
    const harness = await RouterTestingHarness.create();

    const contactLink = fixture.debugElement.queryAll(By.css('a'))[1].nativeElement;
    contactLink.click();

    await harness.navigateByUrl('/legal-mentions');

    const routedNativeElement = harness.routeNativeElement;
    expect(routedNativeElement).not.toBeNull();
    expect(routedNativeElement!.textContent).toContain('legal-mentions works!');
  });
});
