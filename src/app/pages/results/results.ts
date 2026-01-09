import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { SearchRideService } from '../../services/search-ride';
import { RideParticipation } from '../../services/ride-participation';
import { Auth } from '../../services/auth';
import { FiltersMeta, Ride, RideSearchResponse } from '../../models/ride-search-response.model';
import { RideParticipationRequest } from '../../models/ride-participation-request.model';
import { SearchBar } from '../../components/search-bar/search-bar';
import { RideSearchRequest } from '../../models/ride-search-request.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchStateService } from '../../services/search-state';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';

const DEFAULT_UI_FILTERS = {
  priceMin: 0,
  priceMax: 250,
  durationMin: 0,
  durationMax: 1440,
  ratingMin: 0,
  electricOnly: false,
};

@Component({
  selector: 'app-results',
  imports: [CommonModule, FormsModule, SearchBar, NgxSliderModule],
  templateUrl: './results.html',
  styleUrls: ['./results.scss'],
})
export class Results implements OnInit, OnDestroy {
  public rides: Ride[] = [];
  private page: number = 1;
  private pageSize: number = 18;
  public totalResults: number = 0;
  public isLoading: boolean = false;
  private noMoreResults: boolean = false;
  public status: 'EXACT_MATCH' | 'FUTURE_MATCH' | 'NO_MATCH' | 'INVALID_REQUEST' = 'NO_MATCH';
  public filtersVisible: boolean = false;
  public orderBy?: 'PRICE_ASC' | 'PRICE_DESC' | 'DURATION_ASC' | 'DURATION_DESC';

  public uiFilters = { ...DEFAULT_UI_FILTERS };

  public filters?: RideSearchRequest['filters'];

  public defaultFilters = {
    priceMin: 0,
    priceMax: 250,
    durationMin: 0,
    durationMax: 1440,
    ratingMin: 0,
    electricOnly: false,
  };

  public filtersMeta: FiltersMeta = {
    price: { min: 0, max: 0 },
    duration: { min: 0, max: 0 },
    rating: { min: 0, max: 5 },
  };

  public defaultFiltersMeta: FiltersMeta = {
    price: { min: 0, max: 250 },
    duration: { min: 0, max: 1440 },
    rating: { min: 0, max: 5 },
  };

  public noResultsMessage: string = '';
  private destroy$ = new Subject<void>();
  private lastPayload!: RideSearchRequest;

  public priceSliderOptions: Options = {
    floor: this.filtersMeta.price.min,
    ceil: this.filtersMeta.price.max,
    draggableRange: true,
    step: 0.5,
    showSelectionBar: true,
    showTicks: false,
    translate: (value: number): string => '',
  };

  public durationSliderOptions: Options = {
    floor: this.filtersMeta.duration.min,
    ceil: this.filtersMeta.duration.max,
    draggableRange: true,
    step: 5,
    showSelectionBar: true,
    showTicks: false,
    translate: (value: number): string => '',
  };

  constructor(
    private searchRideService: SearchRideService,
    private searchState: SearchStateService,
    private rideParticipation: RideParticipation,
    public auth: Auth,
    private router: Router
  ) {}

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  public ngOnInit(): void {
    const state = this.searchState.getState();

    if (!state.originCity || !state.destinyCity || !state.date) {
      this.router.navigate(['/']);
      return;
    }

    this.lastPayload = {
      ...state,
      page: 1,
      limit: this.pageSize,
    };
    this.filters = undefined;
    this.orderBy = undefined;
    this.performSearch(true);

    this.searchState.getStateObservable().subscribe((newState) => {
      if (!newState.originCity || !newState.destinyCity || !newState.date) return;

      // Changes onde search-bar => new search
      const isNewSearch =
        newState.originCity !== this.lastPayload.originCity ||
        newState.destinyCity !== this.lastPayload.destinyCity ||
        newState.date?.year !== this.lastPayload.date?.year ||
        newState.date?.month !== this.lastPayload.date?.month ||
        newState.date?.day !== this.lastPayload.date?.day;

      if (isNewSearch) {
        this.lastPayload = { ...newState, page: 1, limit: this.pageSize };

        // Reset filters and orderBy
        this.filters = undefined;
        this.orderBy = undefined;

        this.performSearch(true);
      }
    });
  }

  // ─────────────────────────────────────────────
  // SEARCH HANDLING
  // ─────────────────────────────────────────────
  private resetResults(): void {
    this.page = 1;
    this.noMoreResults = false;
    this.rides = [];
  }

  private initializeFromResponse(res: RideSearchResponse): void {
    this.status = res.status;

    this.rides = res.rides.map((r) => ({
      ...r,
      showDetails: false,
      participating: false,
    }));

    this.totalResults = res.totalResults ?? res.rides.length;
    this.page = 2;
    this.noMoreResults = this.rides.length >= this.totalResults;

    if (res.filtersMeta) {
      this.filtersMeta = res.filtersMeta;

      this.uiFilters.priceMin = res.filtersMeta.price.min;
      this.uiFilters.priceMax = res.filtersMeta.price.max;
      this.uiFilters.durationMin = res.filtersMeta.duration.min;
      this.uiFilters.durationMax = res.filtersMeta.duration.max;

      this.priceSliderOptions = {
        ...this.priceSliderOptions,
        floor: res.filtersMeta.price.min,
        ceil: res.filtersMeta.price.max,
      };
      this.durationSliderOptions = {
        ...this.durationSliderOptions,
        floor: res.filtersMeta.duration.min,
        ceil: res.filtersMeta.duration.max,
      };
    }
  }

  private performSearch(reset = true): void {
    if (reset) this.resetResults();

    this.isLoading = true;

    this.searchRideService
      .searchRides({
        ...this.lastPayload,
        page: this.page,
        limit: this.pageSize,
        orderBy: this.orderBy,
        filters: this.filters,
      })
      .subscribe({
        next: (res) => {
          if (reset) {
            this.initializeFromResponse(res);
          } else {
            this.rides.push(
              ...res.rides.map((r) => ({
                ...r,
                showDetails: false,
                participating: false,
              }))
            );
            this.page++;
            if (this.rides.length >= this.totalResults) this.noMoreResults = true;
          }

          if (res.status === 'NO_MATCH') {
            const isFilteredSearch = this.hasActiveFilters() || !!this.orderBy;
            if (isFilteredSearch) {
              this.noResultsMessage = this.buildNoResultsMessage();
            } else {
              this.noResultsMessage =
                'Malheureusement, aucun covoiturage ne correspond à vos critères de recherche.';
            }
          } else {
            this.noResultsMessage = '';
          }

          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
  }

  // ─────────────────────────────────────────────
  // FILTERS & ORDER
  // ─────────────────────────────────────────────
  public toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible;
  }

  public applyFilters(): void {
    const f: RideSearchRequest['filters'] = {};

    if (this.uiFilters.electricOnly) f.electricOnly = true;
    if (this.uiFilters.ratingMin > 0) f.ratingMin = this.uiFilters.ratingMin;
    if (this.uiFilters.priceMax < DEFAULT_UI_FILTERS.priceMax) {
      f.priceMax = this.uiFilters.priceMax;
    }
    if (this.uiFilters.durationMax < DEFAULT_UI_FILTERS.durationMax) {
      f.durationMax = this.uiFilters.durationMax;
    }

    this.filters = Object.keys(f).length ? f : undefined;

    this.searchState.setFilters(this.filters);
    this.performSearch(true);
  }

  public applyOrder(): void {
    this.searchState.setOrder(this.orderBy);
    this.performSearch(true);
  }

  public formatDuration(minutes: number | null): string {
    if (minutes == null) {
      return '0';
    }

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return `${h} h ${m.toString().padStart(2, '0')}`;
  }

  public clearFilters(): void {
    this.uiFilters = { ...DEFAULT_UI_FILTERS };
    this.filters = undefined;
    this.page = 1;
    this.performSearch(true);
  }

  public hasActiveFilters(): boolean {
    return (
      this.uiFilters.electricOnly ||
      this.uiFilters.ratingMin > 0 ||
      this.uiFilters.priceMax !== this.defaultFilters.priceMax ||
      this.uiFilters.durationMax !== this.defaultFilters.durationMax
    );
  }

  public buildNoResultsMessage(): string {
    const parts: string[] = [];

    if (this.uiFilters.electricOnly) {
      parts.push('en véhicules électriques');
    }
    if (this.uiFilters.priceMax < this.defaultFilters.priceMax) {
      parts.push(`avec un prix inférieur à ${this.uiFilters.priceMax} €`);
    }
    if (this.uiFilters.durationMax < this.defaultFilters.durationMax) {
      parts.push(`avec une durée inférieure à ${this.formatDuration(this.uiFilters.durationMax)}`);
    }
    if (this.uiFilters.ratingMin > 0) {
      parts.push(
        `avec un chauffeur.trice ayant des évaluations supérieures à ${this.uiFilters.ratingMin} étoiles`
      );
    }

    if (parts.length === 0) {
      return 'Malheureusement, aucun covoiturage ne correspond à vos critères de recherche.';
    }

    let message = 'Malheureusement, aucun trajet ne correspond à votre recherche ';
    if (parts.length === 1) {
      message += parts[0] + '.';
    } else {
      const lastPart = parts.pop();
      message += parts.join(', ') + ' et ' + lastPart + '.';
    }

    return message;
  }

  // ─────────────────────────────────────────────
  // PAGINATION
  // ─────────────────────────────────────────────
  public loadRides(): void {
    if (this.noMoreResults || this.isLoading) return;

    this.searchState.nextPage();
    const state = this.searchState.getState();

    this.searchRideService
      .searchRides({
        ...this.lastPayload,
        page: state.page,
        limit: this.pageSize,
        orderBy: this.orderBy,
        filters: this.filters,
      })
      .subscribe({
        next: (res) => {
          this.rides.push(
            ...res.rides.map((r) => ({
              ...r,
              showDetails: false,
              participating: false,
            }))
          );
          this.page++;
          if (this.rides.length >= this.totalResults) {
            this.noMoreResults = true;
          }
        },
        error: () => (this.isLoading = false),
      });
  }

  // ─────────────────────────────────────────────
  // UI HELPERS
  // ─────────────────────────────────────────────
  public getStarType(starNumber: number, avgRating: number | null): 'full' | 'half' | 'empty' {
    if (avgRating === null) return 'empty';

    const diff = avgRating - starNumber + 1;
    if (diff >= 0.85) return 'full';
    if (diff >= 0.26) return 'half';
    return 'empty';
  }

  private defaultDriverImage = 'assets/user_photo_default.png';

  public getDriverImage(ride: any): string {
    return ride?.driver?.photoThumbnail || this.defaultDriverImage;
  }

  public onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.defaultDriverImage;
  }

  public toggleDetails(ride: Ride): void {
    ride.showDetails = !ride.showDetails;
  }

  // ─────────────────────────────────────────────
  // PARTICIPATION
  // ─────────────────────────────────────────────
  public participate(ride: Ride): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const userId = this.auth.getUserId();
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    const payload: RideParticipationRequest = {
      rideId: ride.id,
      userId: userId,
    };

    if (!ride.participating) {
      this.rideParticipation.addPassengerToRide(payload).subscribe({
        next: () => {
          ride.participating = true;
        },
        error: (err) => console.error('Erreur lors de la participation au trajet', err),
      });
    } else {
      this.rideParticipation.removePassengerFromRide(payload).subscribe({
        next: () => {
          ride.participating = false;
        },
        error: (err) => console.error("Erreur lors de l'annulation de la participation", err),
      });
    }
  }

  // ─────────────────────────────────────────────
  // DESTROY
  // ─────────────────────────────────────────────
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
