import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbDatepicker, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { BigTitle } from '../../components/big-title/big-title';
import { ValidationService } from '../../services/validation';
import { UserCreateService } from '../../services/user-create';
import { UserSignupRequest } from '../../models/user-signup-request.model';
import { UserSignupResponse } from '../../models/user-signup-response.model';
import { RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [BigTitle, NgbDatepickerModule, ReactiveFormsModule, CommonModule, RouterLinkWithHref],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
  standalone: true,
})
export class Signup implements OnDestroy {
  form: FormGroup;
  previewUrl: string | ArrayBuffer | null = null;
  maxFileSizeMB = 2;
  showPassword = false;
  showConfirmPassword = false;

  /** Error messages */
  errorFirstName = 'Certains caractères ne sont pas autorisés';
  errorLastName = 'Certains caractères ne sont pas autorisés';
  errorNickname = 'Certains caractères ne sont pas autorisés';
  errorDate = 'Date invalide';
  errorUnderAge =
    'Nous sommes désolés, nos services sont actuellement proposés uniquement aux personnes majeures.';
  errorTelephone = 'Numéro de téléphone invalide';
  errorEmail = 'Adresse e-mail invalide';
  errorPassword =
    'Le mot de passe doit avoir ≥8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial';
  errorConfirmPassword = 'Les mots de passe ne correspondent pas';
  errorProfilePicture = "Fichier invalide : JPG/PNG jusqu'à 2MB, nom sécurisé";

  today = new Date();
  minDate: NgbDateStruct = {
    year: this.today.getFullYear() - 100,
    month: 1,
    day: 1,
  };

  maxDate: NgbDateStruct = {
    year: this.today.getFullYear(),
    month: this.today.getMonth() + 1,
    day: this.today.getDate(),
  };

  /** Status flags */
  responseReceived = false;
  successMessage: string | null = null;
  serverError = false;
  userAlreadyExists = false;
  nicknameAlreadyExists = false;

  /** Reset Response State */
  private resetResponseState(): void {
    this.responseReceived = false;

    this.successMessage = null;
    this.userAlreadyExists = false;
    this.nicknameAlreadyExists = false;
    this.invalidUsageType = false;
    this.backendFormError = null;
    this.serverError = false;
  }

  /** Backend form error (INVALID_*) */
  backendFormError: {
    label: string;
    rules?: string;
  } | null = null;
  invalidUsageType = false;
  private readonly errorMessages: Record<
    UserSignupResponse['status'],
    { label: string; rules?: string }
  > = {
    INVALID_FIRST_NAME: {
      label: 'Votre prénom',
      rules:
        "doit contenir uniquement des lettres (y compris accents), et peut inclure des espaces, apostrophes ou tirets (ex : Jean-Pierre, O'Neil)",
    },
    INVALID_LAST_NAME: {
      label: 'Votre nom',
      rules:
        'doit contenir uniquement des lettres (y compris accents), et peut inclure des espaces, apostrophes ou tirets',
    },
    INVALID_NICKNAME: {
      label: 'Votre pseudo',
      rules:
        'doit contenir entre 3 et 20 caractères, commencer par une lettre ou un chiffre, et peut inclure uniquement : lettres, chiffres et les caractères - . * @',
    },
    INVALID_EMAIL: {
      label: 'Votre email',
      rules: 'doit être une adresse valide (exemple : prenom.nom@email.com)',
    },
    INVALID_TELEPHONE: {
      label: 'Votre numéro de téléphone',
      rules:
        'doit contenir uniquement des chiffres, entre 8 et 15 caractères (sans espaces ni symboles)',
    },
    INVALID_PASSWORD: {
      label: 'Votre mot de passe',
      rules:
        'doit contenir au minimum 8 caractères, avec au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
    },
    INVALID_BIRTHDAY: {
      label: 'Votre date de naissance',
      rules: "doit être sélectionnée à l'aide du calendrier et correspondre à une date valide",
    },
    UNDERAGE: {
      label: 'Âge requis',
      rules: 'vous devez avoir au moins 18 ans pour utiliser nos services',
    },

    // ignored
    INVALID_USAGE_TYPE: { label: '' },
    EMAIL_ALREADY_EXISTS: { label: '' },
    NICKNAME_ALREADY_EXISTS: { label: '' },
    SUCCESS: { label: '' },
  };

  /** Nickname validation */
  nicknameExists = false;
  nicknameCheckMessage = 'Ce pseudo est déjà pris';
  private nicknameSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    public validation: ValidationService,
    private userCreateService: UserCreateService,
  ) {
    this.form = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        nickname: ['', Validators.required],
        date: ['', [Validators.required, this.validation.minimumAgeValidator(18)]],
        telephone: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
        usageType: ['', Validators.required],
        address: this.fb.group(
          {
            street: [
              '',
              [
                (control: { value: string | null }) =>
                  this.validation.isSafeText(control.value) ? null : { unsafeText: true },
              ],
            ],
            number: [
              '',
              [
                (control: { value: string | null }) =>
                  this.validation.isSafeText(control.value) ? null : { unsafeText: true },
              ],
            ],
            complement: [
              '',
              [
                (control: { value: string | null }) =>
                  this.validation.isSafeText(control.value) ? null : { unsafeText: true },
              ],
            ],
            city: [
              '',
              [
                (control: { value: string | null }) =>
                  this.validation.isSafeText(control.value) ? null : { unsafeText: true },
              ],
            ],
            zipcode: [
              '',
              [
                (control: { value: string | null }) =>
                  this.validation.isSafeText(control.value) ? null : { unsafeText: true },
              ],
            ],
            country: [
              '',
              [
                (control: { value: string | null }) =>
                  this.validation.isSafeText(control.value) ? null : { unsafeText: true },
              ],
            ],
          },
          { validators: this.validation.addressIfOneThenAllValidator() },
        ),
        profilePicture: [null],
      },
      {
        validators: this.validation.passwordMatchValidator('password', 'confirmPassword'),
      },
    );
    this.form.updateValueAndValidity();

    // Validation of nickname with endpoint
    this.nicknameSub = this.form
      .get('nickname')!
      .valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((nick) => {
          return nick ? this.userCreateService.checkNicknameExists(nick) : of(false);
        }),
      )
      .subscribe((exists) => {
        const control = this.form.get('nickname');
        if (!control) return;

        const errors = control.errors || {};

        if (exists) {
          errors['nicknameTaken'] = true;
        } else {
          delete errors['nicknameTaken'];
        }

        control.setErrors(Object.keys(errors).length ? errors : null);

        this.nicknameExists = exists && !!control.value?.trim();
      });
  }

  ngOnDestroy(): void {
    this.nicknameSub?.unsubscribe();
  }

  // ─────────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────────
  onSigningUp(): void {
    this.resetResponseState();

    if (this.form.invalid) return;

    const request = this.buildRequest();
    const formData = this.buildFormData(request);

    this.userCreateService.create(formData).subscribe({
      next: (response: UserSignupResponse) => {
        this.handleResponse(response);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },

      error: (err) => {
        this.responseReceived = true;

        const backendResponse = err?.error as UserSignupResponse | undefined;

        if (backendResponse?.status) {
          this.handleResponse(backendResponse);
        } else {
          // Technic error
          this.serverError = true;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  }
  // ─────────────────────────────────────────────
  // REQUEST BUILDERS
  // ─────────────────────────────────────────────
  private buildRequest(): UserSignupRequest {
    const value = this.form.value;

    return {
      firstName: value.firstName,
      lastName: value.lastName,
      nickname: value.nickname,
      birthday: value.date,
      telephone: value.telephone,
      email: value.email,
      password: value.password,
      usageType: value.usageType,
      address: {
        street: value.address.street,
        number: value.address.number,
        complement: value.address.complement,
        city: value.address.city,
        zipcode: value.address.zipcode,
        country: value.address.country,
      },
      profilePicture: value.profilePicture,
    };
  }

  /**
   * Transport layer
   * Backend expects multipart/form-data (image stored as BLOB)
   */
  private buildFormData(request: UserSignupRequest): FormData {
    const formData = new FormData();

    formData.append('firstName', request.firstName);
    formData.append('lastName', request.lastName);
    formData.append('nickname', request.nickname);
    formData.append('telephone', request.telephone);
    formData.append('email', request.email);
    formData.append('password', request.password);
    formData.append('usageType', request.usageType);

    // birthday → string (Symfony DateTime)
    const { year, month, day } = request.birthday;
    formData.append(
      'birthday',
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    );

    if (request.address) {
      formData.append('address', JSON.stringify(request.address));
    }

    if (request.profilePicture) {
      formData.append('photo', request.profilePicture);
    }

    return formData;
  }
  // ─────────────────────────────────────────────
  // RESPONSE HANDLING
  // ─────────────────────────────────────────────
  private handleResponse(response: UserSignupResponse): void {
    this.responseReceived = true;
    this.successMessage = null;
    this.userAlreadyExists = false;
    this.nicknameAlreadyExists = false;
    this.backendFormError = null;
    this.invalidUsageType = false;

    if (response.status.startsWith('INVALID_')) {
      if (response.status === 'INVALID_USAGE_TYPE') {
        this.invalidUsageType = true;
        return;
      }

      this.backendFormError = this.errorMessages[response.status];
      return;
    }

    switch (response.status) {
      case 'SUCCESS':
        this.successMessage = `Nous sommes ravis de vous compter parmi nous, ${this.form.value.firstName} !`;
        break;
      case 'EMAIL_ALREADY_EXISTS':
        this.userAlreadyExists = true;
        break;
      case 'NICKNAME_ALREADY_EXISTS':
        this.nicknameAlreadyExists = true;
        break;
    }
  }

  // ─────────────────────────────────────────────
  // FILE HANDLING
  // ─────────────────────────────────────────────
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      this.previewUrl = null;

      // Validation
      if (!this.validation.isValidProfilePicture(file, this.maxFileSizeMB)) {
        const control = this.form.get('profilePicture');
        if (control) {
          control.setErrors({ invalid: true });
          control.markAsTouched();
        }
        return;
      }

      // Update form and preview
      this.form.patchValue({ profilePicture: file });
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result);
      reader.readAsDataURL(file);

      // Clean previous errors
      this.form.get('profilePicture')?.setErrors(null);
    }
  }

  removeFile() {
    this.form.patchValue({ profilePicture: null });
    this.previewUrl = null;

    // Clean real input to allow re-upload
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  // ─────────────────────────────────────────────
  // VALIDATION UI
  // ─────────────────────────────────────────────

  showError(controlName: string): boolean {
    const control = this.form.get(controlName);
    if (!control) return false;

    switch (controlName) {
      case 'firstName':
        return control.touched && !this.validation.isValidName(control.value);
      case 'lastName':
        return control.touched && !this.validation.isValidName(control.value);
      case 'nickname':
        return control.touched && !this.validation.isValidNickname(control.value);
      case 'date':
        return (
          (control.touched || control.dirty) &&
          (!this.validation.isValidDate(control.value) || control.hasError('underAge'))
        );
      case 'telephone':
        return control.touched && !this.validation.isValidTelephone(control.value);
      case 'email':
        return control.touched && control.invalid;
      case 'password':
        return control.touched && !this.validation.isValidPassword(control.value);
      case 'confirmPassword':
        return control.touched && this.form.hasError('passwordMismatch');
      case 'allNecessaryInputsAreFilled':
        const addressGroup = this.form.get('address');
        return (
          !!addressGroup?.errors?.['incompleteAddress'] &&
          (addressGroup.touched || this.form.touched)
        );
      case 'addressUnsafeText':
        const addr = this.form.get('address');
        return (
          !!addr &&
          (addr.get('street')?.errors?.['unsafeText'] ||
            addr.get('number')?.errors?.['unsafeText'] ||
            addr.get('complement')?.errors?.['unsafeText'] ||
            addr.get('city')?.errors?.['unsafeText'] ||
            addr.get('zipcode')?.errors?.['unsafeText'] ||
            addr.get('country')?.errors?.['unsafeText'])
        );
      case 'profilePicture':
        return control.touched && !!control.errors;
      default:
        return false;
    }
  }

  // ─────────────────────────────────────────────
  // UI HELPERS
  // ─────────────────────────────────────────────
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
