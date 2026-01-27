import { SearchRideService } from './search-ride';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { RideSearchRequest } from '../models/ride-search-request.model';
import { RideSearchResponse } from '../models/ride-search-response.model';

describe('SearchRideService', () => {
  let service: SearchRideService;
  let httpMock: jest.Mocked<HttpClient>;

  beforeEach(() => {
    httpMock = {
      get: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    service = new SearchRideService(httpMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call API with correct params and return rides', () => {
    const request: RideSearchRequest = {
      originCity: 'Paris',
      destinyCity: 'Lyon',
      date: { year: 2026, month: 1, day: 26 },
      page: 1,
      limit: 10,
      orderBy: 'PRICE_ASC',
      filters: { electricOnly: true },
    };

    const mockResponse: RideSearchResponse = {
      status: 'EXACT_MATCH',
      rides: [],
      totalResults: 0,
      filtersMetaGlobal: {
        electric: true,
        drivers0: true,
        price: { min: 0, max: 50 },
        duration: { min: 0, max: 180 },
      },
      filtersMeta: {
        electric: true,
        drivers0: true,
        price: { min: 0, max: 50 },
        duration: { min: 0, max: 180 },
      },
    };

    httpMock.get.mockReturnValue(of(mockResponse));

    service.searchRides(request).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    // Verifica se HttpClient.get foi chamado com URL e HttpParams
    expect(httpMock.get).toHaveBeenCalledWith(
      service['apiUrl'],
      expect.objectContaining({
        params: expect.any(HttpParams),
      }),
    );

    // Checa se os parâmetros estão corretos
    const calledParams = httpMock.get.mock.calls[0][1]?.params as HttpParams;
    expect(calledParams.get('originCity')).toBe('Paris');
    expect(calledParams.get('destinyCity')).toBe('Lyon');
    expect(calledParams.get('date[year]')).toBe('2026');
    expect(calledParams.get('date[month]')).toBe('1');
    expect(calledParams.get('date[day]')).toBe('26');
    expect(calledParams.get('page')).toBe('1');
    expect(calledParams.get('limit')).toBe('10');
    expect(calledParams.get('orderBy')).toBe('PRICE_ASC'); // corrigido
    expect(calledParams.get('filters[electricOnly]')).toBe('true'); // corrigido
  });

  it('should handle empty response', () => {
    const request: RideSearchRequest = { originCity: 'Paris', destinyCity: 'Lyon' };

    const emptyResponse: RideSearchResponse = {
      status: 'NO_MATCH',
      rides: [],
      totalResults: 0,
      filtersMetaGlobal: {
        electric: true,
        drivers0: true,
        price: { min: 0, max: 50 },
        duration: { min: 0, max: 180 },
      },
      filtersMeta: {
        electric: true,
        drivers0: true,
        price: { min: 0, max: 50 },
        duration: { min: 0, max: 180 },
      },
    };

    httpMock.get.mockReturnValue(of(emptyResponse));

    service.searchRides(request).subscribe((response) => {
      expect(response.rides.length).toBe(0);
      expect(response.status).toBe('NO_MATCH');
    });
  });
});
