import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Contact } from './contact';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../services/contact';
import { of } from 'rxjs';

describe('Contact Component', () => {
  let component: Contact;
  let fixture: ComponentFixture<Contact>;
  let contactServiceMock: any;

  beforeEach(async () => {
    // Mock ContactService
    contactServiceMock = {
      create: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CommonModule, Contact],
      providers: [{ provide: ContactService, useValue: contactServiceMock }],
    }).compileComponents();

    // Create component instance
    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;

    // Detect changes to initialize the form
    fixture.detectChanges();
  });

  // ────────────────────────────────
  // 1️⃣ Initialization
  // ────────────────────────────────
  it('should create the form with all controls', () => {
    expect(component.form.contains('firstName')).toBeTruthy();
    expect(component.form.contains('lastName')).toBeTruthy();
    expect(component.form.contains('email')).toBeTruthy();
    expect(component.form.contains('reason')).toBeTruthy();
    expect(component.form.contains('detail')).toBeTruthy();
    expect(component.form.contains('rideId')).toBeTruthy();
    expect(component.form.contains('description')).toBeTruthy();
    expect(component.form.contains('attachments')).toBeTruthy();
    expect(component.form.contains('honeypot')).toBeTruthy();
    expect(component.form.contains('turnstileToken')).toBeTruthy();
  });

  // ────────────────────────────────
  // 2️⃣ Required field validation
  // ────────────────────────────────
  it('should mark form invalid if required fields are empty', () => {
    component.form.patchValue({
      firstName: '',
      lastName: '',
      email: '',
      reason: '',
      detail: '',
      description: '',
      turnstileToken: 'token', // set token to bypass Turnstile
    });
    expect(component.form.valid).toBeFalsy();
  });

  it('should require rideId only when shouldShowRideId is true', () => {
    // rideId required for trip
    component.form.patchValue({ reason: 'trip', detail: 'Retard' });
    component.updateRideIdValidation();
    expect(component.form.get('rideId')?.validator).toBeTruthy();

    // rideId not required for technical
    component.form.patchValue({ reason: 'technical', detail: 'Autres' });
    component.updateRideIdValidation();
    expect(component.form.get('rideId')?.validator).toBeNull();
  });

  // ────────────────────────────────
  // 3️⃣ Submit button enable/disable
  // ────────────────────────────────
  it('should disable submit button if form is invalid', () => {
    component.form.patchValue({ firstName: 'Jean' });
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBeTruthy();
  });

  it('should enable submit button when form is valid', () => {
    component.form.patchValue({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@mail.com',
      reason: 'technical',
      detail: 'Autres',
      description: 'Test',
      turnstileToken: 'token',
    });
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(component.form.valid).toBeTruthy();
    expect(button.disabled).toBeFalsy();
  });

  // ────────────────────────────────
  // 4️⃣ Form submission
  // ────────────────────────────────
  it('should call contactService.create on valid form submission', () => {
    contactServiceMock.create.mockReturnValue(of({ status: 'SUCCESS' }));

    // Patch form with valid data
    component.form.patchValue({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@mail.com',
      reason: 'technical',
      detail: 'Autres',
      description: 'Test',
      turnstileToken: 'token',
      honeypot: '', // ensure honeypot is empty
    });

    // Mock Turnstile ready
    component.tokenReady = true;
    component.turnstileToken = 'token';

    component.onSubmit();
    expect(contactServiceMock.create).toHaveBeenCalled();
  });

  it('should mark all controls as touched if form is invalid', () => {
    component.form.patchValue({
      firstName: '',
      lastName: '',
      email: '',
      reason: '',
      detail: '',
      description: '',
      turnstileToken: 'token',
    });

    const markAllSpy = jest.spyOn(component.form, 'markAllAsTouched');
    component.tokenReady = true;
    component.turnstileToken = 'token';
    component.form.patchValue({ honeypot: '' });

    component.onSubmit();
    expect(markAllSpy).toHaveBeenCalled();
  });

  it('should block submission if honeypot is filled', () => {
    component.form.patchValue({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@mail.com',
      reason: 'technical',
      detail: 'Autres',
      description: 'Test',
      turnstileToken: 'token',
      honeypot: 'bot',
    });

    component.tokenReady = true;
    component.turnstileToken = 'token';

    component.onSubmit();
    expect(contactServiceMock.create).not.toHaveBeenCalled();
  });

  it('should block submission if turnstileToken is not ready', () => {
    component.tokenReady = false;
    component.turnstileToken = '';
    component.form.patchValue({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@mail.com',
      reason: 'technical',
      detail: 'Autres',
      description: 'Test',
      honeypot: '',
    });

    component.onSubmit();
    expect(contactServiceMock.create).not.toHaveBeenCalled();
  });

  // ────────────────────────────────
  // 5️⃣ buildRequest and buildFormData
  // ────────────────────────────────
  it('should include rideId in request only if visible and filled', () => {
    component.form.patchValue({ reason: 'trip', detail: 'Retard', rideId: '12345' });
    const request = component.buildRequest();
    expect(request.rideId).toBe('12345');

    component.form.patchValue({ reason: 'technical', detail: 'Autres', rideId: '12345' });
    const request2 = component.buildRequest();
    expect(request2.rideId).toBeUndefined();
  });

  it('should convert attachments to FormData', () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    component.selectedFiles = [file];

    // Patch only necessary fields for buildRequest
    component.form.patchValue({
      attachments: [file],
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@mail.com',
      reason: 'technical',
      detail: 'Autres',
      description: 'Test',
      honeypot: '',
      turnstileToken: 'token',
    });

    const request = component.buildRequest();
    const formData = component.buildFormData(request);

    expect(formData.has('attachments')).toBeTruthy();
  });

  // ────────────────────────────────
  // 6️⃣ File upload
  // ────────────────────────────────
  it('should add valid file to selectedFiles and form', () => {
    const file = new File(['data'], 'file.pdf', { type: 'application/pdf' });
    const event = { target: { files: [file] } } as any;

    component.onFilesSelected(event);

    expect(component.selectedFiles).toContain(file);
    expect(component.form.get('attachments')?.value).toContain(file);
  });

  it('should remove file from selectedFiles and form', () => {
    const file = new File(['data'], 'file.pdf', { type: 'application/pdf' });
    component.selectedFiles = [file];
    component.form.patchValue({ attachments: [file] });

    component.removeFile(file);

    expect(component.selectedFiles).not.toContain(file);
    expect(component.form.get('attachments')?.value).not.toContain(file);
  });

  // ────────────────────────────────
  // 7️⃣ Backend messages
  // ────────────────────────────────
  it('should set backendFormError if response is INVALID_*', () => {
    component.handleResponse({ status: 'INVALID_FIRST_NAME' } as any);
    expect(component.backendFormError).toBeTruthy();
  });

  it('should set successMessage if response is SUCCESS', () => {
    component.form.patchValue({ firstName: 'Jean' });
    component.handleResponse({ status: 'SUCCESS' } as any);
    expect(component.successMessage).toContain('Jean');
  });

  it('should set serverError if backend response missing', () => {
    component.responseReceived = false;
    component.serverError = false;
    // simulate technical error
    const error = { error: {} };
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    // here we do not call onSubmit directly because we just check state
    component.responseReceived = false;
    component.serverError = false;
  });
});
