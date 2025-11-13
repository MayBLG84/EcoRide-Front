import { render, screen, fireEvent } from '@testing-library/angular';
import { Header } from './header';
import { Auth } from '../../services/auth';
import { Router, ActivatedRoute } from '@angular/router';

describe('Header Component', () => {
  let authServiceMock: Partial<Auth>;
  let routerMock: Partial<Router>;
  let activatedRouteMock: Partial<ActivatedRoute>;

  beforeEach(() => {
    // Mock Auth
    authServiceMock = {
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(false),
      getUserId: jasmine.createSpy('getUserId').and.returnValue(null),
      logout: jasmine.createSpy('logout'),
    };

    // Mock Router
    routerMock = {
      navigate: jasmine.createSpy('navigate'),
      routerState: { root: {} } as any,
      url: '',
    } as any;

    // Mock ActivatedRoute
    activatedRouteMock = {
      snapshot: {} as any,
    } as any;
  });

  const renderHeader = async () => {
    await render(Header, {
      providers: [
        { provide: Auth, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    });
  };

  it('should render logo and brand', async () => {
    await renderHeader();
    expect(screen.getByAltText('Logo EcoRide')).toBeTruthy();
    expect(screen.getByText('EcoRide')).toBeTruthy();
  });

  describe('when user is logged out', () => {
    it('should display correct links', async () => {
      await renderHeader();
      expect(screen.getByText('Accueil')).toBeTruthy();
      expect(screen.getByText('Contact')).toBeTruthy();
      expect(screen.getByText('Connexion')).toBeTruthy();
      expect(screen.getByText("S'inscrire")).toBeTruthy();
      expect(screen.queryByText('Mon espace')).toBeNull();
      expect(screen.queryByText('Déconnexion')).toBeNull();
    });
  });

  describe('when user is logged in', () => {
    beforeEach(() => {
      (authServiceMock.isLoggedIn as jasmine.Spy).and.returnValue(true);
      (authServiceMock.getUserId as jasmine.Spy).and.returnValue('123');
    });

    it('should display correct links', async () => {
      await renderHeader();
      expect(screen.getByText('Accueil')).toBeTruthy();
      expect(screen.getByText('Contact')).toBeTruthy();
      expect(screen.getByText('Mon espace')).toBeTruthy();
      expect(screen.getByText('Déconnexion')).toBeTruthy();
      expect(screen.queryByText('Connexion')).toBeNull();
      expect(screen.queryByText("S'inscrire")).toBeNull();
    });

    it('should logout when Déconnexion is clicked', async () => {
      await renderHeader();
      fireEvent.click(screen.getByText('Déconnexion'));
      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  it('should toggle mobile menu when burger button is clicked', async () => {
    await renderHeader();
    const burgerButton = screen.getByRole('button');
    fireEvent.click(burgerButton);

    const mobileMenu = document.querySelector('.mobile-menu');
    expect(mobileMenu).toHaveClass('open');

    fireEvent.click(burgerButton);
    expect(mobileMenu).not.toHaveClass('open');
  });
});
