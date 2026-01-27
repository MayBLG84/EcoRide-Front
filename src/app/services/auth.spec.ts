import { TestBed } from '@angular/core/testing';
import { Auth } from './auth';

describe('Auth Service', () => {
  let service: Auth;

  // Mock simples do localStorage
  const mockLocalStorage: Record<string, string> = {};

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => mockLocalStorage[key] || null,
        setItem: (key: string, value: string) => {
          mockLocalStorage[key] = value;
        },
        removeItem: (key: string) => {
          delete mockLocalStorage[key];
        },
        clear: () => {
          for (const key in mockLocalStorage) delete mockLocalStorage[key];
        },
      },
      writable: true,
    });
  });

  beforeEach(() => {
    // Limpa o mock antes de cada teste
    for (const key in mockLocalStorage) delete mockLocalStorage[key];

    TestBed.configureTestingModule({
      providers: [Auth],
    });

    service = TestBed.inject(Auth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize signals based on localStorage', () => {
    mockLocalStorage['token'] = 'fake-token';
    mockLocalStorage['userId'] = 'user-123';

    const authWithData = new Auth();
    expect(authWithData.isLoggedIn()).toBe(true);
    expect(authWithData.getUserId()).toBe('user-123');
  });

  it('should login correctly', () => {
    service.login('user-1', 'token-1');

    expect(mockLocalStorage['token']).toBe('token-1');
    expect(mockLocalStorage['userId']).toBe('user-1');
    expect(service.isLoggedIn()).toBe(true);
    expect(service.getUserId()).toBe('user-1');
  });

  it('should logout correctly', () => {
    service.login('user-2', 'token-2');
    service.logout();

    expect(mockLocalStorage['token']).toBeUndefined();
    expect(mockLocalStorage['userId']).toBeUndefined();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getUserId()).toBeNull();
  });

  it('should return userId correctly', () => {
    expect(service.getUserId()).toBeNull();
    service.login('user-3', 'token-3');
    expect(service.getUserId()).toBe('user-3');
  });

  it('should return isLoggedIn correctly', () => {
    expect(service.isLoggedIn()).toBe(false);
    service.login('user-4', 'token-4');
    expect(service.isLoggedIn()).toBe(true);
  });
});
