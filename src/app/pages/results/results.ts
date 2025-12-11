import { Component, OnInit } from '@angular/core';
import { SearchRideService } from '../../services/search-ride';
import { Ride, RideSearchResponse } from '../../models/ride-search-response.model';
import { SearchBar } from '../../components/search-bar/search-bar';

@Component({
  selector: 'app-results',
  imports: [SearchBar],
  templateUrl: './results.html',
  styleUrls: ['./results.scss'],
})
export class ResultsComponent implements OnInit {
  rides: Ride[] = [];
  page: number = 1;
  pageSize: number = 18;
  totalResults: number = 0;
  isLoading: boolean = false;
  noMoreResults: boolean = false;

  constructor(private searchRideService: SearchRideService) {}

  ngOnInit(): void {
    const navigation = history.state;

    if (navigation.results) {
      this.initializeFromState(navigation.results as RideSearchResponse);
    } else {
      // Para testar layout, criar 6 cards falsos
      this.createFakeRides();
      // Se quiser usar o backend, descomente a linha abaixo
      // this.loadRides();
    }
  }

  private initializeFromState(res: RideSearchResponse) {
    this.rides = res.rides.map((r) => ({ ...r, showDetails: false, participating: false }));
    this.totalResults = res.totalResults ?? res.rides.length;
    this.page = 2;
    this.noMoreResults = this.rides.length >= (res.totalResults ?? 0);
  }

  loadRides(): void {
    if (this.noMoreResults || this.isLoading) return;

    this.isLoading = true;

    this.searchRideService
      .searchRides({
        originCity: '',
        destinyCity: '',
        date: { year: 0, month: 0, day: 0 },
        page: this.page,
      })
      .subscribe({
        next: (res: RideSearchResponse) => {
          const ridesWithFlags = res.rides.map((r) => ({
            ...r,
            showDetails: false,
            participating: false,
          }));
          this.rides.push(...ridesWithFlags);
          this.totalResults = res.totalResults ?? res.rides.length;
          if (this.rides.length >= this.totalResults) this.noMoreResults = true;
          this.page++;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  getStarType(starNumber: number, avgRating: number | null): 'full' | 'half' | 'empty' {
    if (avgRating === null) return 'empty';

    const diff = avgRating - starNumber + 1;
    if (diff >= 0.85) return 'full';
    if (diff >= 0.26) return 'half';
    return 'empty';
  }

  toggleDetails(ride: Ride): void {
    ride.showDetails = !ride.showDetails;
  }

  participate(ride: Ride): void {
    ride.participating = !ride.participating;
  }

  // Função para criar rides falsas temporárias
  private createFakeRides(): void {
    this.rides = Array.from({ length: 6 }).map((_, i) => ({
      id: i + 1,
      driver: {
        id: i + 1,
        nickname: `Chauffeur ${i + 1}`,
        photoThumbnail: null, // ou link de placeholder
        avgRating: Math.random() * 5,
      },
      date: '2025-12-12',
      departureTime: '14:30',
      availableSeats: 3,
      origin: { city: 'Paris' },
      destiny: { city: 'Lyon' },
      estimatedDuration: '2h 45min',
      vehicle: { brand: 'Tesla', model: 'Model 3', isElectric: true },
      preferences: { smoker: false, animals: true, other: 'Musique forte' },
      pricePerPerson: 25,
      showDetails: false,
      participating: false,
    }));
    this.totalResults = this.rides.length;
  }
}
