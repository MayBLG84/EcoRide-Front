import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BigTitle } from '../../components/big-title/big-title';
import { LoginService } from '../../services/login';
import { Auth } from '../../services/auth';
import { UserLoginRequest } from '../../models/user-login-request.model';
import { UserLoginResponse } from '../../models/user-login-response.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [BigTitle, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
})
export class Login implements OnInit {
  form!: FormGroup;
  showPassword = false;
  honeypot = '';
  turnstileToken = '';
  siteKey = environment.turnstileSiteKey;
  tokenReady = false;

  backendStatus: UserLoginResponse['status'] | null = null;
  backendErrorMessage: string | null = null;
  turnstileTokenErrorMessage: string | null = null;

  errorEmail = 'Adresse e-mail invalide';

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private authService: Auth,
    private router: Router,
  ) {}

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      honeypot: [''],
      turnstileToken: [''],
    });

    // Callback global Turnstile
    (window as any).onTurnstileSuccess = (token: string) => {
      console.log('Turnstile token recebido:', token);
      this.turnstileToken = token;
      this.tokenReady = true;
    };

    // Render manual do widget
    if ((window as any).turnstile) {
      (window as any).turnstile.render('#turnstile-container', {
        sitekey: this.siteKey,
        callback: (token: string) => {
          console.log('Callback Turnstile:', token);
          this.turnstileToken = token;
          this.tokenReady = true;
        },
        theme: 'light',
      });
    }
  }

  // ─────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────
  onLogin(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Honeypot check (front-end)
    if (this.form.get('honeypot')?.value) {
      console.warn('Bot detected! Form submission blocked.');
      return;
    }

    // cleans ancient errors
    this.backendErrorMessage = null;
    this.turnstileTokenErrorMessage = null;

    // Checks if the TurnstileToken is ready
    if (!this.tokenReady || !this.turnstileToken) {
      console.warn('Turnstile token is not ready. Wait...');
      this.turnstileTokenErrorMessage = 'Por favor, complete o captcha antes de continuar.';
      return;
    }

    const request: UserLoginRequest = {
      email: this.form.value.email,
      password: this.form.value.password,
      honeypot: this.form.value.honeypot,
      turnstileToken: this.turnstileToken,
    };

    console.log('Payload enviado ao backend:', request);

    this.loginService.login(request).subscribe({
      next: (res: UserLoginResponse) => this.handleResponse(res),
      error: (err) => {
        const body = err.error as UserLoginResponse;
        if (body?.status) {
          this.handleResponse(body);
        } else {
          this.backendErrorMessage =
            'Un problème technique est survenu. Nous vous invitons à réessayer plus tard.';
        }
      },
    });
  }

  // ─────────────────────────────────────────────
  // RESPONSE HANDLER
  // ─────────────────────────────────────────────
  private handleResponse(response: UserLoginResponse): void {
    this.backendStatus = response.status;

    switch (response.status) {
      case 'INVALID_INPUTS':
        this.backendErrorMessage =
          'Malheureusement, les informations ne sont pas valides. Veuillez saisir un e-mail et un mot de passe corrects.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;

      case 'INTERNAL_ERROR':
        this.backendErrorMessage =
          "Malheureusement, il n'a pas été possible de compléter votre demande. Veuillez réessayer plus tard.";
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;

      case 'TOO_MANY_ATTEMPTS':
        this.backendErrorMessage =
          'Vous avez effectué trop de tentatives. Merci de patienter avant de réessayer.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;

      case 'SUCCESS':
        break;

      default:
        this.backendErrorMessage =
          'Un problème technique est survenu. Nous vous invitons à réessayer plus tard.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // LOGIN SUCCESS
    if (response.userId && response.token && response.roles) {
      this.authService.login(response);

      if (response.roles.includes('ROLE_DRIVER') || response.roles.includes('ROLE_PASSENGER')) {
        this.router.navigate(['/']);
      } else if (response.roles.includes('ROLE_ADMIN')) {
        this.router.navigate(['/', response.userId, 'dashboard']);
      } else if (response.roles.includes('ROLE_EMPLOYEE')) {
        this.router.navigate(['/', response.userId, 'evaluations']);
      }
    }
  }

  // ─────────────────────────────────────────────
  // UI HELPERS
  // ─────────────────────────────────────────────
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  showError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.invalid;
  }

  get isFormValidAndCaptcha(): boolean {
    const emailValid = this.form.get('email')?.valid;
    const passwordValid = this.form.get('password')?.valid;
    return !!emailValid && !!passwordValid && !!this.turnstileToken;
  }
}
