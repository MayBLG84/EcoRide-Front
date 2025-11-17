import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { provideRouter, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Home } from '../../pages/home/home';
import { MySpace } from '../../pages/my-space/my-space';
import { Contact } from '../../pages/contact/contact';
import { Login } from '../../pages/login/login';
import { Signup } from '../../pages/signup/signup';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let component: Header;
  let authMock: any;
  let router: Router;

  const routes: Routes = [
    { path: '', component: Home },
    { path: ':userId/my-space', component: MySpace },
    { path: 'contact', component: Contact },
    { path: 'login', component: Login },
    { path: 'signup', component: Signup },
  ];

  beforeEach(async () => {
    authMock = {
      isLoggedIn: jest.fn().mockReturnValue(false),
      getUserId: jest.fn().mockReturnValue(null),
      logout: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter(routes), { provide: Auth, useValue: authMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  function resetComponent(loggedIn: boolean, userId: string | null = null) {
    authMock.isLoggedIn.mockReturnValue(loggedIn);
    authMock.getUserId.mockReturnValue(userId);
    component.ngOnInit();
    fixture.detectChanges();
  }

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show logo and brand', () => {
    const logo = fixture.nativeElement.querySelector('.logo') as HTMLImageElement;
    const brand = fixture.nativeElement.querySelector('.brand') as HTMLElement;

    expect(logo).toBeTruthy();
    expect(brand).toBeTruthy();
    expect(brand.textContent).toContain('EcoRide');
  });

  it('should logout and navigate to home on deconnexion click', async () => {
    resetComponent(true, '123');

    const harness = await RouterTestingHarness.create();
    const links = fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    const logoutLink = Array.from(links).find((a) => a.textContent?.includes('Déconnexion'))!;

    logoutLink.click();
    fixture.detectChanges();

    expect(authMock.logout).toHaveBeenCalled();
    expect(component.isLoggedIn()).toBe(false);
    expect(component.userId()).toBeNull();

    await harness.navigateByUrl('/');
    const routedElement = await harness.routeNativeElement;
    expect(routedElement).not.toBeNull();
  });

  it('should toggle mobile menu when burger is clicked', () => {
    const burger = fixture.nativeElement.querySelector('.burger') as HTMLButtonElement;

    expect(component.menuOpen()).toBe(false);

    burger.click();
    fixture.detectChanges();
    expect(component.menuOpen()).toBe(true);

    burger.click();
    fixture.detectChanges();
    expect(component.menuOpen()).toBe(false);
  });

  it('should close menu when closeMenu() is called', () => {
    component.menuOpen.set(true);
    component.closeMenu();
    fixture.detectChanges();
    expect(component.menuOpen()).toBe(false);
  });

  it('should navigate to correct links (desktop and mobile)', async () => {
    resetComponent(false);
    const harness = await RouterTestingHarness.create();
    const links = fixture.nativeElement.querySelectorAll(
      'a[routerLink]'
    ) as NodeListOf<HTMLAnchorElement>;

    for (const link of Array.from(links)) {
      const route = link.getAttribute('ng-reflect-router-link') || link.getAttribute('routerLink');
      if (route) {
        await harness.navigateByUrl(route);
        const el = await harness.routeNativeElement;
        expect(el).not.toBeNull();
      }
    }
  });
});
