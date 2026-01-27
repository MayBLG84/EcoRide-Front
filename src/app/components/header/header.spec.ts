import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import { Router, provideRouter } from '@angular/router';
import { Auth } from '../../services/auth';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let component: Header;

  let authMock: any;
  let router: Router;

  beforeEach(async () => {
    authMock = {
      isLoggedIn: jest.fn().mockReturnValue(false),
      getUserId: jest.fn().mockReturnValue(null),
      logout: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([]), { provide: Auth, useValue: authMock }],
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

  it('should logout and navigate to home on deconnexion click', () => {
    resetComponent(true, '123');

    const navigateSpy = jest.spyOn(router, 'navigate');

    const links = fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    const logoutLink = Array.from(links).find((a) => a.textContent?.includes('Déconnexion'))!;

    logoutLink.click();
    fixture.detectChanges();

    expect(authMock.logout).toHaveBeenCalled();
    expect(component.isLoggedIn()).toBe(false);
    expect(component.userId()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
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

  it('should show the correct links when user is logged in', () => {
    resetComponent(true, '123'); // logged in

    const html = fixture.nativeElement.textContent;

    // Expected links
    expect(html).toContain('EcoRide');
    expect(html).toContain('Accueil');
    expect(html).toContain('Mon espace');
    expect(html).toContain('Contact');
    expect(html).toContain('Déconnexion');

    // Links that must NOT appear
    expect(html).not.toContain('Connexion');
    expect(html).not.toContain("S'inscrire");
  });

  it('should show the correct links when user is logged out', () => {
    resetComponent(false, null); // logged out

    const html = fixture.nativeElement.textContent;

    // Expected links
    expect(html).toContain('EcoRide');
    expect(html).toContain('Accueil');
    expect(html).toContain('Contact');
    expect(html).toContain('Connexion');
    expect(html).toContain("S'inscrire");

    // Links that must NOT appear
    expect(html).not.toContain('Mon espace');
    expect(html).not.toContain('Déconnexion');
  });
});
