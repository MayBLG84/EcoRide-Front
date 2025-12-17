import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, filter, takeUntil } from 'rxjs/operators';
import { SearchRideService } from '../../services/search-ride';
import { RideParticipation } from '../../services/ride-participation';
import { Auth } from '../../services/auth';
import { Ride, RideSearchResponse } from '../../models/ride-search-response.model';
import { RideParticipationRequest } from '../../models/ride-participation-request.model';
import { SearchBar } from '../../components/search-bar/search-bar';
import { RideSearchRequest } from '../../models/ride-search-request.model';

@Component({
  selector: 'app-results',
  imports: [SearchBar],
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

  private destroy$ = new Subject<void>();
  private lastPayload!: RideSearchRequest;

  constructor(
    private searchRideService: SearchRideService,
    private route: ActivatedRoute,
    private rideParticipation: RideParticipation,
    public auth: Auth,
    private router: Router
  ) {}

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
          };

          this.resetResults();
          return this.searchRideService.searchRides(this.lastPayload);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((res) => this.initializeFromResponse(res));
  }

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
  }

  loadRides(): void {
    if (this.noMoreResults || this.isLoading) return;

    this.isLoading = true;

    this.searchRideService
      .searchRides({
        ...this.lastPayload,
        page: this.page,
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

          if (this.rides.length >= this.totalResults) this.noMoreResults = true;
          this.page++;
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
  }

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
