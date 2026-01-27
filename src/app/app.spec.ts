import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { LOCALE_ID, Component } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('App Component', () => {
  @Component({ selector: 'router-outlet', template: '', standalone: true })
  class RouterOutletStub {}

  @Component({ selector: '[routerLink]', template: '', standalone: true })
  class RouterLinkStubDirective {}

  beforeAll(() => {
    jest.isolateModules(() => {
      jest.mock('@angular/common', () => {
        const original = jest.requireActual('@angular/common');
        return {
          ...original,
          registerLocaleData: jest.fn(),
        };
      });
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, Header, Footer, RouterOutletStub, RouterLinkStubDirective],
      providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }, provideRouter([])],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render header, router-outlet, and footer', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  });

  it('should provide LOCALE_ID as fr-FR', () => {
    const locale = TestBed.inject(LOCALE_ID);
    expect(locale).toBe('fr-FR');
  });

  it('should initialize the title signal correctly', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app['title']()).toBe('EcoRide-Front');
  });
});
