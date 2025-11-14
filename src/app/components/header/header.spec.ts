import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { Header } from './header';
import { Auth } from '../../services/auth';

describe('Header Component', () => {
  let mockAuth: Partial<Auth>;

  beforeEach(() => {
    mockAuth = {
      isLoggedIn: jest.fn().mockReturnValue(false),
      getUserId: jest.fn().mockReturnValue(null),
      logout: jest.fn(),
    };
  });

  it('should create the component', async () => {
    const { fixture } = await render(Header, {
      providers: [provideRouter([]), { provide: Auth, useValue: mockAuth }],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render navigation links', async () => {
    await render(Header, {
      providers: [provideRouter([]), { provide: Auth, useValue: mockAuth }],
    });

    expect(screen.getByText('Accueil')).toBeTruthy();
    expect(screen.getByText('Contact')).toBeTruthy();
    expect(screen.getByText('Connexion')).toBeTruthy();
    expect(screen.getByText("S'inscrire")).toBeTruthy();
  });

  it('should toggle menu open state', async () => {
    const { fixture } = await render(Header, {
      providers: [provideRouter([]), { provide: Auth, useValue: mockAuth }],
    });

    const component = fixture.componentInstance;
    expect(component.menuOpen()).toBe(false);

    component.toggleMenu();
    expect(component.menuOpen()).toBe(true);

    component.closeMenu();
    expect(component.menuOpen()).toBe(false);
  });

  it('should log out and navigate home', async () => {
    const navigateMock = jest.fn();
    const mockRouter = { navigate: navigateMock } as any;

    const { fixture } = await render(Header, {
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: mockAuth },
        { provide: 'Router', useValue: mockRouter },
      ],
    });

    const component = fixture.componentInstance;

    component.logout();

    expect(mockAuth.logout).toHaveBeenCalled();
    expect(component.isLoggedIn()).toBe(false);
    expect(component.userId()).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith(['/']);
  });
});
