import { ValidationService } from './validation';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup } from '@angular/forms';

describe('ValidationService (Jest)', () => {
  let service: ValidationService;

  beforeEach(() => {
    service = new ValidationService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('City validation', () => {
    it('should validate valid city names', () => {
      expect(service.isValidCity('Paris')).toBe(true);
      expect(service.isValidCity('Saint-Étienne')).toBe(true);
    });

    it('should invalidate invalid city names', () => {
      expect(service.isValidCity('Paris123')).toBe(false);
      expect(service.isValidCity('')).toBe(false);
      expect(service.isValidCity(null)).toBe(false);
    });
  });

  describe('Name validation', () => {
    it('should validate valid names', () => {
      expect(service.isValidName('John')).toBe(true);
      expect(service.isValidName('Jean-Pierre')).toBe(true);
    });

    it('should invalidate invalid names', () => {
      expect(service.isValidName('John123')).toBe(false);
      expect(service.isValidName('')).toBe(false);
      expect(service.isValidName(null)).toBe(false);
    });
  });

  describe('Nickname validation', () => {
    it('should validate valid nicknames', () => {
      expect(service.isValidNickname('john123')).toBe(true);
      expect(service.isValidNickname('a.b-c*d@e')).toBe(true);
    });

    it('should invalidate invalid nicknames', () => {
      expect(service.isValidNickname('ab')).toBe(false); // too short
      expect(service.isValidNickname('')).toBe(false);
      expect(service.isValidNickname(null)).toBe(false);
    });
  });

  describe('Password validation', () => {
    it('should validate strong passwords', () => {
      expect(service.isValidPassword('Abcd1234!')).toBe(true);
    });

    it('should invalidate weak passwords', () => {
      expect(service.isValidPassword('abc')).toBe(false);
      expect(service.isValidPassword('password')).toBe(false);
      expect(service.isValidPassword(null)).toBe(false);
    });
  });

  describe('Password match validator', () => {
    it('should return null if passwords match', () => {
      const group = new FormGroup({
        password: new FormControl('Abcd1234!'),
        confirmPassword: new FormControl('Abcd1234!'),
      });

      const validator = service.passwordMatchValidator('password', 'confirmPassword');
      expect(validator(group)).toBeNull();
    });

    it('should return error if passwords do not match', () => {
      const group = new FormGroup({
        password: new FormControl('Abcd1234!'),
        confirmPassword: new FormControl('abcd1234!'),
      });

      const validator = service.passwordMatchValidator('password', 'confirmPassword');
      expect(validator(group)).toEqual({ passwordMismatch: true });
    });
  });

  describe('Telephone validation', () => {
    it('should validate valid telephone numbers', () => {
      expect(service.isValidTelephone('12345678')).toBe(true);
      expect(service.isValidTelephone('123456789012345')).toBe(true);
    });

    it('should invalidate invalid telephone numbers', () => {
      expect(service.isValidTelephone('123')).toBe(false);
      expect(service.isValidTelephone('1234567890123456')).toBe(false);
      expect(service.isValidTelephone(null)).toBe(false);
    });
  });

  describe('Date validation', () => {
    it('should validate proper NgbDateStruct', () => {
      const validDate: NgbDateStruct = { year: 2000, month: 1, day: 1 };
      expect(service.isValidDate(validDate)).toBe(true);
    });

    it('should invalidate improper dates', () => {
      const invalidDate1: NgbDateStruct = { year: 0, month: 1, day: 1 };
      const invalidDate2: NgbDateStruct = { year: 2000, month: 13, day: 1 };
      const invalidDate3: NgbDateStruct = { year: 2000, month: 2, day: 30 };

      expect(service.isValidDate(invalidDate1)).toBe(false);
      expect(service.isValidDate(invalidDate2)).toBe(false);
      expect(service.isValidDate(invalidDate3)).toBe(false);
      expect(service.isValidDate(null)).toBe(false);
    });
  });

  describe('Age validation', () => {
    it('should validate minimum age', () => {
      const date: NgbDateStruct = { year: 2000, month: 1, day: 1 };
      expect(service.isAtLeastAge(date, 18)).toBe(true);
      expect(service.isAtLeastAge(date, 30)).toBe(false);
    });
  });

  describe('Minimum age validator', () => {
    it('should return null if age is sufficient', () => {
      const control = new FormControl({ year: 2000, month: 1, day: 1 });
      expect(service.minimumAgeValidator(18)(control)).toBeNull();
    });

    it('should return error if age is insufficient', () => {
      const control = new FormControl({ year: 2010, month: 1, day: 1 });
      expect(service.minimumAgeValidator(18)(control)).toEqual({ underAge: true });
    });
  });

  describe('Address validator', () => {
    it('should return error if some address fields are filled but not all', () => {
      const group = new FormGroup({
        street: new FormControl('Main St'),
        number: new FormControl(''),
        city: new FormControl('Paris'),
        zipcode: new FormControl('75000'),
        country: new FormControl(''),
      });
      expect(service.addressIfOneThenAllValidator()(group)).toEqual({ incompleteAddress: true });
    });

    it('should return null if all or none are filled', () => {
      const group = new FormGroup({
        street: new FormControl('Main St'),
        number: new FormControl('123'),
        city: new FormControl('Paris'),
        zipcode: new FormControl('75000'),
        country: new FormControl('FR'),
      });
      expect(service.addressIfOneThenAllValidator()(group)).toBeNull();

      const emptyGroup = new FormGroup({
        street: new FormControl(''),
        number: new FormControl(''),
        city: new FormControl(''),
        zipcode: new FormControl(''),
        country: new FormControl(''),
      });
      expect(service.addressIfOneThenAllValidator()(emptyGroup)).toBeNull();
    });
  });

  describe('Profile picture validation', () => {
    it('should validate correct files', () => {
      const file = new File(['content'], 'avatar.png', {
        type: 'image/png',
        lastModified: Date.now(),
      });
      expect(service.isValidProfilePicture(file)).toBe(true);
    });

    it('should invalidate wrong types, size or name', () => {
      const file = new File(['content'], 'avatar.pdf', {
        type: 'application/pdf',
        lastModified: Date.now(),
      });
      expect(service.isValidProfilePicture(file)).toBe(false);

      const bigFile = new File([new ArrayBuffer(3 * 1024 * 1024)], 'big.png', {
        type: 'image/png',
      });
      expect(service.isValidProfilePicture(bigFile)).toBe(false);

      const badName = new File(['content'], 'bad@name.png', { type: 'image/png' });
      expect(service.isValidProfilePicture(badName)).toBe(false);
    });
  });

  describe('Non-empty validation', () => {
    it('should detect non-empty values', () => {
      expect(service.isNonEmpty('Hello')).toBe(true);
      expect(service.isNonEmpty(' ')).toBe(false);
      expect(service.isNonEmpty(null)).toBe(false);
      expect(service.isNonEmpty(undefined)).toBe(false);
    });
  });

  describe('Safe text validation', () => {
    it('should detect safe text', () => {
      expect(service.isSafeText('Hello World')).toBe(true);
      expect(service.isSafeText("John's car, café")).toBe(true);
      expect(service.isSafeText('<script>')).toBe(false);
    });
  });
});
