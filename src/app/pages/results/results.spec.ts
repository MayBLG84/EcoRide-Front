import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Results } from './results';
import { SearchBar } from '../../components/search-bar/search-bar';
import { SearchRideService } from '../../services/search-ride';
import { SearchStateService } from '../../services/search-state';
import { RideParticipation } from '../../services/ride-participation';
import { Auth } from '../../services/auth';
import { Ride } from '../../models/ride-search-response.model';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  template: '',
})
class SearchBarStub {}

describe('Results Component', () => {
  let component: Results;
  let fixture: ComponentFixture<Results>;

  let searchRideServiceMock: jest.Mocked<SearchRideService>;
  let searchStateMock: jest.Mocked<SearchStateService>;
  let rideParticipationMock: jest.Mocked<RideParticipation>;
  let authMock: jest.Mocked<Auth>;
  let routerMock: jest.Mocked<Router>;

  const mockRide: Ride = {
    id: 1,
    driver: {
      id: 10,
      nickname: 'Alice',
      photoThumbnail: null,
      avgRating: 4.5,
    },
    date: '12/10/2026',
    departureTime: '08:30',
    availableSeats: 3,
    origin: { city: 'Paris', pickPoint: 'Gare du Nord' },
    destiny: { city: 'Lyon', dropPoint: 'Centre' },
    estimatedDuration: 120,
    vehicle: {
      brand: 'Tesla',
      model: 'Model 3',
      isElectric: true,
    },
    preferences: {
      smoker: false,
      animals: false,
      other: '',
    },
    pricePerPerson: 25,
    showDetails: false,
    participating: false,
  };

  const filtersMetaGlobal = {
    electric: true,
    drivers0: true,
    price: { min: 0, max: 50 },
    duration: { min: 0, max: 180 },
  };

  beforeEach(async () => {
    searchRideServiceMock = {
      searchRides: jest.fn().mockReturnValue(
        of({
          status: 'EXACT_MATCH',
          rides: [mockRide],
          totalResults: 1,
          filtersMetaGlobal: filtersMetaGlobal,
          filtersMeta: {},
        }),
      ),
    } as any;

    searchStateMock = {
      getState: jest.fn().mockReturnValue({
        originCity: 'Paris',
        destinyCity: 'Lyon',
        date: { year: 2026, month: 10, day: 12 },
        page: 1,
      }),
      getStateObservable: jest.fn().mockReturnValue(of({})),
      setFilters: jest.fn(),
      setOrder: jest.fn(),
      nextPage: jest.fn(),
    } as any;

    rideParticipationMock = {
      addPassengerToRide: jest.fn().mockReturnValue(of({})),
      removePassengerFromRide: jest.fn().mockReturnValue(of({})),
    } as any;

    authMock = {
      isLoggedIn: jest.fn().mockReturnValue(true),
      getUserId: jest.fn().mockReturnValue('user-1'),
    } as any;

    routerMock = {
      navigate: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [Results],
      providers: [
        { provide: SearchRideService, useValue: searchRideServiceMock },
        { provide: SearchStateService, useValue: searchStateMock },
        { provide: RideParticipation, useValue: rideParticipationMock },
        { provide: Auth, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    })
      .overrideComponent(Results, {
        remove: { imports: [SearchBar] },
        add: { imports: [SearchBarStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Results);
    component = fixture.componentInstance;
  });

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  it('should render search-bar and headline', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-search-bar')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('h2')?.textContent).toContain(
      'Le résultat de votre recherche',
    );
  });

  it('EXACT_MATCH without filters → show filters and cards', () => {
    component.status = 'EXACT_MATCH';
    component.rides = [mockRide];
    component.filtersMetaGlobal = filtersMetaGlobal;
    component.priceSliderOptions = { floor: 0, ceil: 50 };
    component.durationSliderOptions = { floor: 0, ceil: 180 };
    component.filtersVisible = true;
    component.isLoading = false;

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.filters-section')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.card-wrapper').length).toBe(1);
  });

  it('FUTURE_MATCH without filters → show future message and cards', () => {
    const futureResponse = {
      status: 'FUTURE_MATCH',
      rides: [mockRide],
      totalResults: null,
      filtersMetaGlobal: {
        electric: false,
        drivers0: false,
        price: { min: 0, max: 0 },
        duration: { min: 0, max: 0 },
      },
      filtersMeta: null,
    };

    jest.spyOn(searchRideServiceMock, 'searchRides').mockReturnValue(of(futureResponse as any));
    (component as any)['performSearch'](true);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.future-results-message')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.filters-panel')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.card-wrapper').length).toBe(1);
  });

  it('EXACT_MATCH with filters → show filters and cards', () => {
    component.status = 'EXACT_MATCH';
    component.rides = [mockRide];
    component.filtersVisible = true;
    component.filtersMetaGlobal = filtersMetaGlobal;
    component.priceSliderOptions = { floor: 0, ceil: 50 };
    component.durationSliderOptions = { floor: 0, ceil: 180 };
    component.isLoading = false;

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.filters-section')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.card-wrapper').length).toBe(1);
  });

  // ─────────────────────────────────────────────
  // NO_MATCH dynamic message
  // ─────────────────────────────────────────────
  it('NO_MATCH with filters → build dynamic no-results message', () => {
    component.uiFilters = {
      electricOnly: true,
      priceMin: 20,
      priceMax: 30,
      durationMin: 0,
      durationMax: 120,
      ratingMin: 4,
    };
    component.filtersMetaGlobal = filtersMetaGlobal;
    const msg = component.buildNoResultsMessage();
    expect(msg).toContain('véhicules électriques');
    expect(msg).toContain('prix');
    expect(msg).toContain('évaluations');
  });

  // ─────────────────────────────────────────────
  // FILTERS & ORDER
  // ─────────────────────────────────────────────
  it('should toggle filters panel', () => {
    expect(component.filtersVisible).toBe(false);
    component.toggleFilters();
    expect(component.filtersVisible).toBe(true);
  });

  it('should apply filters and call state service', () => {
    component.filtersMetaGlobal = filtersMetaGlobal;
    component.applyFilters();
    expect(searchStateMock.setFilters).toHaveBeenCalled();
  });

  it('should clear filters', () => {
    component.filtersMetaGlobal = filtersMetaGlobal;
    component.clearFilters();
    expect(component.uiFilters.priceMin).toBe(0);
    expect(component.uiFilters.electricOnly).toBe(false);
  });

  // ─────────────────────────────────────────────
  // JOIN / CANCEL RIDE
  // ─────────────────────────────────────────────
  it('should participate in ride', () => {
    component.participate(mockRide);
    expect(rideParticipationMock.addPassengerToRide).toHaveBeenCalled();
    expect(mockRide.participating).toBe(true);
  });

  it('should cancel participation', () => {
    mockRide.participating = true;
    component.participate(mockRide);
    expect(rideParticipationMock.removePassengerFromRide).toHaveBeenCalled();
    expect(mockRide.participating).toBe(false);
  });

  // ─────────────────────────────────────────────
  // TOGGLE DETAILS & STAR TYPE
  // ─────────────────────────────────────────────
  it('should toggle ride details', () => {
    component.toggleDetails(mockRide);
    expect(mockRide.showDetails).toBe(true);
  });

  it('should return correct star type', () => {
    expect(component.getStarType(4, 4)).toBe('full');
    expect(component.getStarType(4, 3)).toBe('empty');
    expect(component.getStarType(4, 3.5)).toBe('half');
  });

  // ─────────────────────────────────────────────
  // TEST performSearch (without integration)
  // ─────────────────────────────────────────────
  it('performSearch should call searchRideService with correct payload', () => {
    const spyService = jest.spyOn(searchRideServiceMock, 'searchRides').mockReturnValue(
      of({
        status: 'EXACT_MATCH',
        rides: [mockRide],
        totalResults: 1,
        filtersMetaGlobal: filtersMetaGlobal,
        filtersMeta: {
          electric: true,
          drivers0: true,
          price: { min: 0, max: 50 },
          duration: { min: 0, max: 180 },
        },
      }),
    );

    component['lastPayload'] = {
      originCity: 'Paris',
      destinyCity: 'Lyon',
      date: { year: 2026, month: 10, day: 12 },
      page: 1,
      limit: 18,
    };
    component['page'] = 1;
    component['filters'] = undefined;
    component['orderBy'] = undefined;

    (component as any)['performSearch'](true);

    expect(spyService).toHaveBeenCalled();
    expect(component.rides.length).toBe(1);
    expect(component.status).toBe('EXACT_MATCH');
    expect(component.filtersMetaGlobal).toEqual(filtersMetaGlobal);
  });
});
