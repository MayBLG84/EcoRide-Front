import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { BigTitle } from '../../components/big-title/big-title';
import { ValidationService } from '../../services/validation';
import { ContactService } from '../../services/contact';
import { ContactRequest } from '../../models/contact-request.model';
import { ContactResponse } from '../../models/contact-response.model';
import { environment } from '../../../environments/environment';

interface Reason {
  value: string;
  label: string;
}

type RideIdRequiredSubcategories = {
  trip: 'all';
  payment: string[];
  safety: string[];
};

@Component({
  selector: 'app-contact',
  imports: [BigTitle, ReactiveFormsModule, CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  standalone: true,
})
export class Contact implements OnInit {
  form: FormGroup;
  selectedFiles: File[] = [];
  maxFileSizeMB = 2;
  maxFiles = 5;
  honeypot = '';
  turnstileToken = '';
  siteKey = environment.turnstileSiteKey;
  tokenReady = false;

  /** Main Categories */
  reasons: Reason[] = [
    { value: 'trip', label: 'Problème avec un voyage' },
    { value: 'payment', label: 'Paiements' },
    { value: 'safety', label: 'Sécurité / Signalement' },
    { value: 'technical', label: 'Problème technique' },
    { value: 'account', label: 'Compte' },
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'praise', label: 'Eloge' },
  ];

  /** Subcategories */
  subcategories: Record<string, string[]> = {
    trip: [
      'Problème avec le conducteur',
      'Problème avec le passager',
      'Annulation inappropriée',
      'Retard',
      'Objet oublié',
      'Autres',
    ],
    payment: [
      'Facturation incorrecte',
      'Paiement non traité',
      'Demande de remboursement',
      'Problème avec le mode de paiement',
      'Autres',
    ],
    safety: [
      'Comportement inapproprié',
      'Conduite dangereuse',
      'Harcèlement',
      'Compte suspect',
      'Autres',
    ],
    technical: [
      'Application plante',
      'Erreur lors de la réservation',
      'Code promotionnel ne fonctionne pas',
      'Autres',
    ],
    account: [
      'Impossible de se connecter',
      'Débloquer mon compte',
      "Informer d'une possible fraude",
      'Supprimer le compte',
      'Autres',
    ],
    suggestion: [
      'Nouvelle fonctionnalité',
      "Amélioration de l'application",
      'Retour général',
      'Autres',
    ],
    praise: ['Eloge du conducteur', "Eloge de l'application", 'Service excellent', 'Autres'],
  };

  currentSubcategories: string[] = [];

  /** Error messages */
  errorFirstName = 'Certains caractères ne sont pas autorisés';
  errorLastName = 'Certains caractères ne sont pas autorisés';
  errorEmail = 'Adresse e-mail invalide';
  errorDescription = 'Le texte ne doit pas dépasser 1000 caractères';
  errorAttachments = {
    maxFiles: 'Maximum 5 fichiers autorisés.',
    maxSize: 'Chaque fichier ne doit pas dépasser 2 Mo.',
    invalidType: 'Formats acceptés : PDF, JPG, JPEG, PNG.',
  };

  /** Status flags */
  responseReceived = false;
  successMessage: string | null = null;
  serverError = false;

  /** Backend form error (INVALID_*) */
  backendFormError: {
    label: string;
    rules?: string;
  } | null = null;

  /** Reset Response State */
  private resetResponseState(): void {
    this.responseReceived = false;

    this.successMessage = null;
    this.backendFormError = null;
    this.serverError = false;
  }

  private readonly errorMessages: Record<
    ContactResponse['status'],
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
    INVALID_EMAIL: {
      label: 'Votre email',
      rules: 'doit être une adresse valide (exemple : prenom.nom@email.com)',
    },
    INVALID_ATTACHMENTS: {
      label: 'Chaque fichier',
      rules:
        'doit avoir une taille maximale de 2 Mo, être au format PDF, JPG, JPEG ou PNG, et un maximum de 5 fichiers est autorisé',
    },

    // ignored
    SUCCESS: { label: '' },

    INVALID_CAPTCHA: {
      label: '',
    },
  };

  constructor(
    private fb: FormBuilder,
    public validation: ValidationService,
    private contactService: ContactService,
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      reason: ['', Validators.required],
      detail: ['', Validators.required],
      rideId: [''],
      description: ['', Validators.required],
      attachments: [null],
      honeypot: [''],
      turnstileToken: ['', Validators.required],
    });
    this.form.updateValueAndValidity();
  }

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  ngOnInit(): void {
    // Callback global Turnstile
    (window as any).onTurnstileSuccess = (token: string) => {
      this.turnstileToken = token;
      this.tokenReady = true;

      this.form.patchValue({ turnstileToken: token });
    };

    // Manuel render of the widget
    if ((window as any).turnstile) {
      (window as any).turnstile.render('#turnstile-container', {
        sitekey: this.siteKey,
        callback: (token: string) => {
          this.turnstileToken = token;
          this.tokenReady = true;

          this.form.patchValue({ turnstileToken: token });
        },
        theme: 'light',
      });
    }

    // Control of rideId
    this.form.get('detail')?.valueChanges.subscribe(() => {
      this.updateRideIdValidation();
    });
  }

  // ─────────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────────
  onSubmit(): void {
    this.resetResponseState();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Honeypot check
    if (this.form.get('honeypot')?.value) {
      console.warn('Bot detected! Submission blocked.');
      return;
    }

    // Turnstile validation
    if (!this.tokenReady || !this.turnstileToken) {
      console.warn('Turnstile token not ready.');
      return;
    }

    const request = this.buildRequest();
    const formData = this.buildFormData(request);

    this.contactService.create(formData).subscribe({
      next: (response: ContactResponse) => {
        this.handleResponse(response);
        this.resetTurnstile();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },

      error: (err) => {
        this.responseReceived = true;

        const backendResponse = err?.error as ContactResponse | undefined;

        if (backendResponse?.status) {
          this.handleResponse(backendResponse);
        } else {
          // Technic error
          this.serverError = true;
        }

        this.resetTurnstile();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  }

  // ─────────────────────────────────────────────
  // RESET TURNSTILE
  // ─────────────────────────────────────────────

  private resetTurnstile(): void {
    if ((window as any).turnstile) {
      (window as any).turnstile.reset();
    }
    this.turnstileToken = '';
    this.tokenReady = false;
  }

  // ─────────────────────────────────────────────
  // SELECT REASON
  // ─────────────────────────────────────────────
  onReasonChange(): void {
    const selectedReason = this.form.get('reason')?.value;
    if (selectedReason && this.subcategories[selectedReason]) {
      this.currentSubcategories = this.subcategories[selectedReason];
      this.form.get('detail')?.setValue('');
    } else {
      this.currentSubcategories = [];
      this.form.get('detail')?.setValue('');
    }
    this.updateRideIdValidation();
  }

  rideIdRequiredSubcategories: RideIdRequiredSubcategories = {
    trip: 'all',
    payment: ['Facturation incorrecte', 'Paiement non traité'],
    safety: ['Comportement inapproprié', 'Conduite dangereuse', 'Harcèlement'],
  };

  shouldShowRideId(): boolean {
    const reason = this.form.get('reason')?.value as keyof RideIdRequiredSubcategories;
    const detail = this.form.get('detail')?.value;

    if (!reason) return false;

    if (this.rideIdRequiredSubcategories[reason] === 'all') {
      return true;
    }

    if (Array.isArray(this.rideIdRequiredSubcategories[reason])) {
      return this.rideIdRequiredSubcategories[reason].includes(detail);
    }

    return false;
  }

  public updateRideIdValidation(): void {
    const rideIdControl = this.form.get('rideId');

    if (this.shouldShowRideId()) {
      rideIdControl?.setValidators([Validators.required]);
    } else {
      rideIdControl?.clearValidators();
      rideIdControl?.setValue('');
    }

    rideIdControl?.updateValueAndValidity();
  }

  // ─────────────────────────────────────────────
  // REQUEST BUILDERS
  // ─────────────────────────────────────────────
  public buildRequest(): ContactRequest {
    const value = this.form.value;

    return {
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      reason: value.reason,
      detail: value.detail,
      description: value.description,
      attachments: this.selectedFiles,
      honeypot: value.honeypot,
      turnstileToken: value.turnstileToken,
      ...(this.shouldShowRideId() && value.rideId ? { rideId: value.rideId } : {}),
    };
  }

  /**
   * Transport layer
   * Backend expects multipart/form-data (image stored as BLOB)
   */
  public buildFormData(request: ContactRequest): FormData {
    const formData = new FormData();

    formData.append('firstName', request.firstName);
    formData.append('lastName', request.lastName);
    formData.append('email', request.email);
    formData.append('reason', request.reason);
    formData.append('detail', request.detail);
    formData.append('description', request.description);

    if (request.attachments && request.attachments.length > 0) {
      request.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    if (request.rideId) {
      formData.append('rideId', request.rideId);
    }

    formData.append('honeypot', request.honeypot ?? '');
    formData.append('turnstileToken', request.turnstileToken ?? '');

    return formData;
  }
  // ─────────────────────────────────────────────
  // RESPONSE HANDLING
  // ─────────────────────────────────────────────
  public handleResponse(response: ContactResponse): void {
    this.responseReceived = true;
    this.successMessage = null;
    this.backendFormError = null;
    this.serverError = false;

    if (response.status.startsWith('INVALID_')) {
      this.backendFormError = this.errorMessages[response.status];
      return;
    }

    switch (response.status) {
      case 'SUCCESS':
        this.successMessage = `Merci ${this.form.value.firstName}, votre message a été envoyé avec succès !`;
        break;
    }
  }

  // ─────────────────────────────────────────────
  // FILE HANDLING (MULTIPLE ATTACHMENTS)
  // ─────────────────────────────────────────────

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const control = this.form.get('attachments');
    const newFiles = Array.from(input.files);

    // Verify limit
    if (this.selectedFiles.length + newFiles.length > this.maxFiles) {
      control?.setErrors({ maxFiles: true });
      control?.markAsTouched();
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    for (const file of newFiles) {
      // Size
      if (file.size > this.maxFileSizeMB * 1024 * 1024) {
        control?.setErrors({ maxSize: true });
        control?.markAsTouched();
        return;
      }

      // Type
      if (!allowedTypes.includes(file.type)) {
        control?.setErrors({ invalidType: true });
        control?.markAsTouched();
        return;
      }

      this.selectedFiles.push(file);
    }

    // Update form
    this.form.patchValue({
      attachments: this.selectedFiles,
    });

    control?.setErrors(null);

    // Clean input
    input.value = '';
  }

  removeFile(file: File): void {
    this.selectedFiles = this.selectedFiles.filter((f) => f !== file);

    this.form.patchValue({
      attachments: this.selectedFiles,
    });

    this.form.get('attachments')?.setErrors(null);
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
      case 'email':
        return control.touched && control.invalid;
      case 'attachments':
        return control.touched && !!control.errors;
      default:
        return false;
    }
  }
}
