import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, filter, takeUntil } from 'rxjs/operators';
import { SearchRideService } from '../../services/search-ride';
import { RideParticipation } from '../../services/ride-participation';
import { Auth } from '../../services/auth';
import { FiltersMeta, Ride, RideSearchResponse } from '../../models/ride-search-response.model';
import { RideParticipationRequest } from '../../models/ride-participation-request.model';
import { SearchBar } from '../../components/search-bar/search-bar';
import { RideSearchRequest } from '../../models/ride-search-request.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-results',
  imports: [CommonModule, FormsModule, SearchBar],
  templateUrl: './results.html',
  styleUrls: ['./results.scss'],
})
export class Results implements OnInit, OnDestroy {
  rides: Ride[] = [];
  page: number = 1;
  pageSize: number = 18;
  totalResults: number = 0;
  isLoading: boolean = false;
  noMoreResults: boolean = false;
  status: 'EXACT_MATCH' | 'FUTURE_MATCH' | 'NO_MATCH' | 'INVALID_REQUEST' = 'NO_MATCH';
  filtersVisible: boolean = false;
  orderBy: '' | 'PRICE_ASC' | 'PRICE_DESC' | 'DURATION_ASC' | 'DURATION_DESC' = '';

  public filters = {
    priceMin: 0,
    priceMax: 250,
    durationMin: 0,
    durationMax: 1440,
    ratingMin: 0,
    electricOnly: false,
  };

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

  private destroy$ = new Subject<void>();
  private lastPayload!: RideSearchRequest;

  constructor(
    private searchRideService: SearchRideService,
    private route: ActivatedRoute,
    private rideParticipation: RideParticipation,
    public auth: Auth,
    private router: Router
  ) {}

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        filter((params) => !!params['originCity']),
        switchMap((params) => {
          this.lastPayload = {
            originCity: params['originCity'],
            destinyCity: params['destinyCity'],
            date: {
              year: +params['year'],
              month: +params['month'],
              day: +params['day'],
            },
            page: 1,
            limit: this.pageSize,
            filters: { ...this.filters },
            orderBy: this.orderBy || undefined,
          };

          this.resetResults();
          return this.searchRideService.searchRides(this.lastPayload);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((res) => this.initializeFromResponse(res));
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
    this.filtersMeta = res.filtersMeta ?? this.defaultFiltersMeta;
    this.page = 2;
    this.noMoreResults = this.rides.length >= this.totalResults;
  }

  private performSearch(reset = true): void {
    if (reset) this.resetResults();

    this.isLoading = true;

    this.searchRideService
      .searchRides({
        ...this.lastPayload,
        page: this.page,
        limit: this.pageSize,
        orderBy: this.orderBy || undefined,
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
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
  }

  // ─────────────────────────────────────────────
  // FILTERS & ORDER
  // ─────────────────────────────────────────────
  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible;
  }

  applyFilters(): void {
    this.page = 1;
    this.performSearch(true);
  }

  applyOrder(): void {
    this.page = 1;
    this.performSearch(true);
  }

  formatDuration(minutes: number | null): string {
    if (minutes == null) {
      return '0';
    }

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return `${h} h ${m.toString().padStart(2, '0')}`;
  }

  clearFilters(): void {
    this.filters = { ...this.defaultFilters };
    this.page = 1;
    this.performSearch(true);
  }

  hasActiveFilters(): boolean {
    return (
      this.filters.electricOnly ||
      this.filters.ratingMin > 0 ||
      this.filters.priceMax !== this.defaultFilters.priceMax ||
      this.filters.durationMax !== this.defaultFilters.durationMax
    );
  }

  // ─────────────────────────────────────────────
  // PAGINATION
  // ─────────────────────────────────────────────
  loadRides(): void {
    if (this.noMoreResults || this.isLoading) return;
    this.performSearch(false);
  }

  // ─────────────────────────────────────────────
  // UI HELPERS
  // ─────────────────────────────────────────────
  getStarType(starNumber: number, avgRating: number | null): 'full' | 'half' | 'empty' {
    if (avgRating === null) return 'empty';

    const diff = avgRating - starNumber + 1;
    if (diff >= 0.85) return 'full';
    if (diff >= 0.26) return 'half';
    return 'empty';
  }

  defaultDriverImage = 'assets/user_photo_default.png';

  getDriverImage(ride: any): string {
    return ride?.driver?.photoThumbnail || this.defaultDriverImage;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.defaultDriverImage;
  }

  toggleDetails(ride: Ride): void {
    ride.showDetails = !ride.showDetails;
  }

  // ─────────────────────────────────────────────
  // PARTICIPATION
  // ─────────────────────────────────────────────
  participate(ride: Ride): void {
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
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
