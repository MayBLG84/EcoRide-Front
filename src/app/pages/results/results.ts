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

@Component({
  selector: 'app-results',
  imports: [CommonModule, FormsModule, SearchBar, NgxSliderModule],
  templateUrl: './results.html',
  styleUrls: ['./results.scss'],
})
export class Results implements OnInit, OnDestroy {
  public rides: Ride[] = [];
  private page: number = 1;
  private limit: number = 18;
  public totalResults: number = 0;
  public isLoading: boolean = false;
  private noMoreResults: boolean = false;
  public status: 'EXACT_MATCH' | 'FUTURE_MATCH' | 'NO_MATCH' | 'INVALID_REQUEST' = 'NO_MATCH';
  public filtersVisible: boolean = false;
  public orderBy?: 'PRICE_ASC' | 'PRICE_DESC' | 'DURATION_ASC' | 'DURATION_DESC';

  public filtersMetaGlobal!: FiltersMeta;

  public uiFilters = {
    priceMin: 0,
    priceMax: 0,
    durationMin: 0,
    durationMax: 0,
    ratingMin: 0,
    electricOnly: false,
  };

  public filters?: RideSearchRequest['filters'];

  public noResultsMessage: string = '';
  private destroy$ = new Subject<void>();
  private lastPayload!: RideSearchRequest;

  public priceSliderOptions: Options = {
    draggableRange: true,
    step: 0.5,
    showSelectionBar: true,
    showTicks: false,
    translate: (value: number) => `${value} €`,
  };

  public durationSliderOptions: Options = {
    draggableRange: true,
    step: 5,
    showSelectionBar: true,
    showTicks: false,
    translate: (value: number) => this.formatDuration(value),
  };

  constructor(
    private searchRideService: SearchRideService,
    private searchState: SearchStateService,
    private rideParticipation: RideParticipation,
    public auth: Auth,
    private router: Router,
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
      limit: this.limit,
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
        this.lastPayload = { ...newState, page: 1, limit: this.limit };

        // Reset filters and orderBy
        this.filters = undefined;
        this.orderBy = undefined;
        this.uiFilters = {
          priceMin: this.filtersMetaGlobal?.price.min ?? 0,
          priceMax: this.filtersMetaGlobal?.price.max ?? 0,
          durationMin: this.filtersMetaGlobal?.duration.min ?? 0,
          durationMax: this.filtersMetaGlobal?.duration.max ?? 0,
          ratingMin: 0,
          electricOnly: false,
        };

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

    this.filtersMetaGlobal = res.filtersMetaGlobal ?? {
      electric: false,
      drivers0: false,
      price: { min: 0, max: 0 },
      duration: { min: 0, max: 0 },
    };

    const fmGlobal = this.filtersMetaGlobal;
    const fm = res.filtersMeta ?? {};

    this.uiFilters.priceMin = fm.price?.min ?? fmGlobal.price.min;
    this.uiFilters.priceMax = fm.price?.max ?? fmGlobal.price.max;
    this.uiFilters.durationMin = fm.duration?.min ?? fmGlobal.duration.min;
    this.uiFilters.durationMax = fm.duration?.max ?? fmGlobal.duration.max;

    this.updateSliderOptions();
  }

  private performSearch(reset = true): void {
    if (reset) this.resetResults();

    this.isLoading = true;

    this.searchRideService
      .searchRides({
        ...this.lastPayload,
        page: this.page,
        limit: this.limit,
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
              })),
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

  private updateSliderOptions(): void {
    this.priceSliderOptions = {
      ...this.priceSliderOptions,
      floor: this.filtersMetaGlobal.price.min,
      ceil: this.filtersMetaGlobal.price.max,
    };

    this.durationSliderOptions = {
      ...this.durationSliderOptions,
      floor: this.filtersMetaGlobal.duration.min,
      ceil: this.filtersMetaGlobal.duration.max,
    };
  }

  public applyFilters(): void {
    const f: RideSearchRequest['filters'] = {};

    if (this.uiFilters.electricOnly) f.electricOnly = true;
    if (this.uiFilters.ratingMin > 0) f.ratingMin = this.uiFilters.ratingMin;

    if (this.uiFilters.priceMin > this.filtersMetaGlobal.price.min) {
      f.priceMin = this.uiFilters.priceMin;
    }

    if (this.uiFilters.priceMax < this.filtersMetaGlobal.price.max) {
      f.priceMax = this.uiFilters.priceMax;
    }

    if (this.uiFilters.durationMin > this.filtersMetaGlobal.duration.min) {
      f.durationMin = this.uiFilters.durationMin;
    }

    if (this.uiFilters.durationMax < this.filtersMetaGlobal.duration.max) {
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
    this.uiFilters.priceMin = this.filtersMetaGlobal.price.min;
    this.uiFilters.priceMax = this.filtersMetaGlobal.price.max;
    this.uiFilters.durationMin = this.filtersMetaGlobal.duration.min;
    this.uiFilters.durationMax = this.filtersMetaGlobal.duration.max;
    this.uiFilters.ratingMin = 0;
    this.uiFilters.electricOnly = false;

    this.filters = undefined;
    this.performSearch(true);
  }

  public hasActiveFilters(): boolean {
    const fm = this.filtersMetaGlobal ?? {
      price: { min: 0, max: 0 },
      duration: { min: 0, max: 0 },
      electric: false,
      drivers0: false,
    };
    return (
      this.uiFilters.electricOnly ||
      this.uiFilters.ratingMin > 0 ||
      this.uiFilters.priceMin > fm.price.min ||
      this.uiFilters.priceMax < fm.price.max ||
      this.uiFilters.durationMin > fm.duration.min ||
      this.uiFilters.durationMax < fm.duration.max
    );
  }

  public buildNoResultsMessage(): string {
    const fm = this.filtersMetaGlobal ?? {
      price: { min: 0, max: 0 },
      duration: { min: 0, max: 0 },
      electric: false,
      drivers0: false,
    };
    const parts: string[] = [];

    if (this.uiFilters.electricOnly) parts.push('en véhicules électriques');
    if (this.uiFilters.priceMin > fm.price.min)
      parts.push(`avec un prix supérieur à ${this.uiFilters.priceMin} €`);
    if (this.uiFilters.priceMax < fm.price.max)
      parts.push(`avec un prix inférieur à ${this.uiFilters.priceMax} €`);
    if (this.uiFilters.durationMin > fm.duration.min)
      parts.push(`avec une durée supérieure à ${this.formatDuration(this.uiFilters.durationMin)}`);
    if (this.uiFilters.durationMax < fm.duration.max)
      parts.push(`avec une durée inférieure à ${this.formatDuration(this.uiFilters.durationMax)}`);
    if (this.uiFilters.ratingMin > 0)
      parts.push(
        `avec un chauffeur.trice ayant des évaluations supérieures à ${this.uiFilters.ratingMin} étoiles`,
      );

    if (parts.length === 0)
      return 'Malheureusement, aucun covoiturage ne correspond à vos critères de recherche.';

    let message = 'Malheureusement, aucun trajet ne correspond à votre recherche ';
    if (parts.length === 1) message += parts[0] + '.';
    else {
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
        limit: this.limit,
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
            })),
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
