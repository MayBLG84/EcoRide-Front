import { TestBed } from '@angular/core/testing';
import { SearchStateService } from './search-state';

describe('SearchStateService (Jest)', () => {
  let service: SearchStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchStateService],
    });

    service = TestBed.inject(SearchStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return initial state', () => {
    const state = service.getState();
    expect(state).toEqual({
      page: 1,
      filters: undefined,
    });
  });

  it('should update base search', () => {
    const newSearch = {
      originCity: 'Paris',
      destinyCity: 'Lyon',
      date: { year: 2026, month: 1, day: 26 },
    };
    const spy = jest.fn();
    service.getStateObservable().subscribe(spy);

    service.setBaseSearch(newSearch);

    const updatedState = service.getState();
    expect(updatedState.page).toBe(1);
    expect(updatedState.originCity).toBe('Paris');
    expect(updatedState.destinyCity).toBe('Lyon');
    expect(updatedState.date).toEqual({ year: 2026, month: 1, day: 26 });
    expect(updatedState.filters).toBeUndefined();
    expect(updatedState.orderBy).toBeUndefined();

    expect(spy).toHaveBeenCalledWith(updatedState);
  });

  it('should set filters and reset page to 1', () => {
    const spy = jest.fn();
    service.getStateObservable().subscribe(spy);

    service.setFilters({ electricOnly: true });

    const state = service.getState();
    expect(state.filters).toEqual({ electricOnly: true });
    expect(state.page).toBe(1);

    expect(spy).toHaveBeenCalledWith(state);
  });

  it('should set order and reset page to 1', () => {
    const spy = jest.fn();
    service.getStateObservable().subscribe(spy);

    service.setOrder('PRICE_ASC');

    const state = service.getState();
    expect(state.orderBy).toBe('PRICE_ASC');
    expect(state.page).toBe(1);

    expect(spy).toHaveBeenCalledWith(state);
  });

  it('should increment page', () => {
    const spy = jest.fn();
    service.getStateObservable().subscribe(spy);

    service.nextPage();

    const state = service.getState();
    expect(state.page).toBe(2);

    expect(spy).toHaveBeenCalledWith(state);
  });

  it('should reset state', () => {
    const spy = jest.fn();
    service.getStateObservable().subscribe(spy);

    service.setBaseSearch({
      originCity: 'Paris',
      destinyCity: 'Lyon',
      date: { year: 1990, month: 4, day: 2 },
    });
    service.setFilters({ electricOnly: true });
    service.nextPage();

    service.reset();

    const state = service.getState();
    expect(state).toEqual({
      page: 1,
      filters: undefined,
    });

    expect(spy).toHaveBeenCalledWith(state);
  });
});
