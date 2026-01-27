import { TestBed } from '@angular/core/testing';
import { CityService, City } from './city';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('CityService', () => {
  let service: CityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), // HttpClient
        provideHttpClientTesting(), // backend
        CityService,
      ],
    });

    service = TestBed.inject(CityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call API with correct query and return cities', () => {
    const mockCities: City[] = [
      { nom: 'Paris', code: '75056' },
      { nom: 'Paray-Vieille-Poste', code: '91500' },
    ];

    service.searchCities('Par').subscribe((cities) => {
      expect(cities).toEqual(mockCities);
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'https://geo.api.gouv.fr/communes' &&
        r.params.get('nom') === 'Par' &&
        r.params.get('limit') === '10',
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockCities);
  });

  it('should return empty array if no cities found', () => {
    service.searchCities('UnknownCity').subscribe((cities) => {
      expect(cities).toEqual([]);
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'https://geo.api.gouv.fr/communes' &&
        r.params.get('nom') === 'UnknownCity' &&
        r.params.get('limit') === '10',
    );

    req.flush([]);
  });
});
