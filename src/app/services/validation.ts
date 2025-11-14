import { Injectable } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  // Regex to accept French city names with accents, spaces, apostrophes and hyphens
  private cityRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;

  /** Validate city name */
  isValidCity(city: string | null | undefined): boolean {
    if (!city) return false;
    return this.cityRegex.test(city.trim());
  }

  /** Validate required fields */
  isNonEmpty(value: any): boolean {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  }

  /** Validate NgbDateStruct */
  isValidDate(date: NgbDateStruct | null | undefined): boolean {
    if (!date) return false;

    const { year, month, day } = date;

    if (!year || !month || !day) return false;

    const jsDate = new Date(year, month - 1, day);
    return jsDate instanceof Date && !isNaN(jsDate.getTime());
  }

  /** Convert NgbDateStruct → JS Date */
  toJsDate(date: NgbDateStruct): Date {
    return new Date(date.year, date.month - 1, date.day);
  }
}
