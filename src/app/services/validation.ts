import { Injectable } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  private cityRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
  private nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+([ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
  private nicknameRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-.*@]{2,19}$/;
  private forbiddenFileChars = /[^a-zA-Z0-9.\-_]/;

  /** Validate city name */
  isValidCity(city: string | null | undefined): boolean {
    if (!city) return false;
    return this.cityRegex.test(city.trim());
  }

  /** Validate names */
  isValidName(name: string | null | undefined): boolean {
    if (!name) return false;
    return this.nameRegex.test(name.trim());
  }

  /** Validate nickname */
  isValidNickname(nick: string | null | undefined): boolean {
    if (!nick) return false;
    return this.nicknameRegex.test(nick.trim());
  }

  /** Validate password */
  isValidPassword(password: string | null | undefined): boolean {
    if (!password) return false;
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{}|;:,.<>/?]).{8,}$/.test(
      password,
    );
  }

  /** Validate matching passwords */
  passwordMatchValidator(passwordKey: string, confirmPasswordKey: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get(passwordKey)?.value;
      const confirmPassword = group.get(confirmPasswordKey)?.value;

      if (!password || !confirmPassword) {
        return null; // deixa required cuidarem disso
      }

      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  /** Validate telephone */
  isValidTelephone(telephone: string | null | undefined): boolean {
    if (!telephone) return false;
    return /^[0-9]{8,15}$/.test(telephone);
  }

  /** Validate NgbDateStruct */
  isValidDate(date: NgbDateStruct | null | undefined): boolean {
    if (!date) return false;

    const { year, month, day } = date;

    if (!year || !month || !day) return false;

    const jsDate = new Date(year, month - 1, day);
    return jsDate instanceof Date && !isNaN(jsDate.getTime());
  }

  addressIfOneThenAllValidator(): ValidatorFn {
    return (group: AbstractControl): { [key: string]: any } | null => {
      const street = group.get('street')?.value;
      const number = group.get('number')?.value;
      const city = group.get('city')?.value;
      const zipcode = group.get('zipcode')?.value;
      const country = group.get('country')?.value;

      const anyFilled = street || number || city || zipcode || country;
      const allFilled = street && number && city && zipcode && country;

      return anyFilled && !allFilled ? { incompleteAddress: true } : null;
    };
  }

  isValidProfilePicture(file: File | null | undefined, maxSizeMB = 2): boolean {
    if (!file) return false;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) return false;

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) return false;

    if (this.forbiddenFileChars.test(file.name)) return false;

    return true;
  }

  /** Validate required fields */
  isNonEmpty(value: any): boolean {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  }

  /** Convert NgbDateStruct → JS Date */
  toJsDate(date: NgbDateStruct): Date {
    return new Date(date.year, date.month - 1, date.day);
  }

  isSafeText(value: string | null): boolean {
    if (!value) return true;
    const pattern = /^[\wÀ-ÖØ-öø-ÿ\s\-',.]+$/;
    return pattern.test(value);
  }
}
