import { Injectable } from '@angular/core';
import { SearchState } from '../models/ride-search-state.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchStateService {
  private state: SearchState = {
    page: 1,
    filters: {},
  };

  private state$ = new BehaviorSubject<SearchState>(structuredClone(this.state));

  // Safety reading
  getState(): SearchState {
    return structuredClone(this.state);
  }

  getStateObservable() {
    return this.state$.asObservable();
  }

  // New search (SearchBar)
  setBaseSearch(data: Pick<SearchState, 'originCity' | 'destinyCity' | 'date'>) {
    this.state = {
      ...this.state,
      ...data,
      page: 1,
      filters: undefined,
      orderBy: undefined,
    };
    this.state$.next(structuredClone(this.state));
  }

  // Filters
  setFilters(filters: SearchState['filters']) {
    this.state = {
      ...this.state,
      filters,
      page: 1,
    };
    this.state$.next(structuredClone(this.state));
  }

  // OrderBy
  setOrder(orderBy: SearchState['orderBy']) {
    this.state = {
      ...this.state,
      orderBy,
      page: 1,
    };
    this.state$.next(structuredClone(this.state));
  }

  // Pages
  nextPage() {
    this.state.page++;
    this.state$.next(structuredClone(this.state));
  }

  // Reset
  reset() {
    this.state = {
      page: 1,
      filters: {},
    };
    this.state$.next(structuredClone(this.state));
  }
}
