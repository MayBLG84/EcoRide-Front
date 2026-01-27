import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Signup } from './signup';
import { ValidationService } from '../../services/validation';
import { UserCreateService } from '../../services/user-create';
import { By } from '@angular/platform-browser';
import { UserSignupResponse } from '../../models/user-signup-response.model';

describe('Signup Component', () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;

  let validationMock: jest.Mocked<ValidationService>;
  let userCreateMock: jest.Mocked<UserCreateService>;

  beforeEach(async () => {
    validationMock = {
      isValidName: jest.fn().mockReturnValue(true),
      isValidNickname: jest.fn().mockReturnValue(true),
      isValidDate: jest.fn().mockReturnValue(true),
      isValidTelephone: jest.fn().mockReturnValue(true),
      isValidPassword: jest.fn().mockReturnValue(true),
      isSafeText: jest.fn().mockReturnValue(true),
      minimumAgeValidator: jest.fn().mockReturnValue(() => null),
      passwordMatchValidator: jest.fn().mockReturnValue(() => null),
      addressIfOneThenAllValidator: jest.fn().mockReturnValue(null),
      isValidProfilePicture: jest.fn().mockReturnValue(true),
    } as any;

    userCreateMock = {
      create: jest.fn(),
      checkNicknameExists: jest.fn().mockReturnValue(of(false)),
    } as any;

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ValidationService, useValue: validationMock },
        { provide: UserCreateService, useValue: userCreateMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Signup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─────────────────────────────────────────────
  // RENDERING
  // ─────────────────────────────────────────────
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render headline', () => {
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2.textContent).toContain('Votre trajet commence ici');
  });

  // ─────────────────────────────────────────────
  // FORM VALIDATION
  // ─────────────────────────────────────────────
  it('should invalidate the form if required fields are empty', () => {
    component.form.patchValue({
      firstName: '',
      lastName: '',
      nickname: '',
      date: '',
      telephone: '',
      email: '',
      password: '',
      confirmPassword: '',
      usageType: '',
    });
    expect(component.form.valid).toBe(false);
  });

  it('should validate the form with valid inputs', () => {
    component.form.patchValue({
      firstName: 'Jean',
      lastName: 'Dupont',
      nickname: 'jdupont',
      date: { year: 1990, month: 1, day: 1 },
      telephone: '0600000000',
      email: 'test@mail.com',
      password: 'Abc12345!',
      confirmPassword: 'Abc12345!',
      usageType: 'PASSENGER',
    });
    expect(component.form.valid).toBe(true);
  });

  // ─────────────────────────────────────────────
  // SUBMISSION
  // ─────────────────────────────────────────────
  it('should call userCreateService.create on valid form submit', fakeAsync(() => {
    component.form.patchValue({
      firstName: 'Jean',
      lastName: 'Dupont',
      nickname: 'jdupont',
      date: { year: 1990, month: 1, day: 1 },
      telephone: '0600000000',
      email: 'test@mail.com',
      password: 'Abc12345!',
      confirmPassword: 'Abc12345!',
      usageType: 'PASSENGER',
    });

    const response: UserSignupResponse = {
      status: 'SUCCESS',
      id: 1,
      firstName: 'Jean',
      lastName: 'Dupont',
      nickname: 'jdupont',
      email: 'test@mail.com',
      createdAt: new Date().toISOString(),
    };
    userCreateMock.create.mockReturnValue(of(response));

    component.onSigningUp();
    tick();

    expect(userCreateMock.create).toHaveBeenCalled();
    expect(component.successMessage).toContain('Nous sommes ravis');
  }));

  it('should handle backend errors', fakeAsync(() => {
    const backendError = { error: { status: 'EMAIL_ALREADY_EXISTS' } };
    userCreateMock.create.mockReturnValue(throwError(() => backendError));

    component.form.patchValue({
      firstName: 'Jean',
      lastName: 'Dupont',
      nickname: 'jdupont',
      date: { year: 1990, month: 1, day: 1 },
      telephone: '0600000000',
      email: 'test@mail.com',
      password: 'Abc12345!',
      confirmPassword: 'Abc12345!',
      usageType: 'PASSENGER',
    });

    component.onSigningUp();
    tick();

    expect(component.userAlreadyExists).toBe(true);
  }));

  it('should handle server errors', fakeAsync(() => {
    const serverError = { error: {} };
    userCreateMock.create.mockReturnValue(throwError(() => serverError));

    component.form.patchValue({
      firstName: 'Jean',
      lastName: 'Dupont',
      nickname: 'jdupont',
      date: { year: 1990, month: 1, day: 1 },
      telephone: '0600000000',
      email: 'test@mail.com',
      password: 'Abc12345!',
      confirmPassword: 'Abc12345!',
      usageType: 'PASSENGER',
    });

    component.onSigningUp();
    tick();

    expect(component.serverError).toBe(true);
  }));

  // ─────────────────────────────────────────────
  // NICKNAME CHECK
  // ─────────────────────────────────────────────
  it('should mark nicknameTaken error if nickname exists', fakeAsync(() => {
    userCreateMock.checkNicknameExists.mockReturnValue(of(true));
    const nicknameControl = component.form.get('nickname');

    nicknameControl?.setValue('takenNick');
    tick(500);

    expect(component.nicknameExists).toBe(true);
    expect(nicknameControl?.errors).toHaveProperty('nicknameTaken');
  }));

  // ─────────────────────────────────────────────
  // FILE UPLOAD
  // ─────────────────────────────────────────────
  it('should update previewUrl on valid file selection', () => {
    const file = new File(['dummy'], 'photo.png', { type: 'image/png' });
    const event = { target: { files: [file] } } as unknown as Event;

    component.onFileSelected(event);

    expect(component.form.value.profilePicture).toBe(file);
  });

  it('should remove selected file', () => {
    component.form.patchValue({ profilePicture: {} });
    component.previewUrl = 'data:image/png;base64,xyz';
    component.removeFile();

    expect(component.form.value.profilePicture).toBeNull();
    expect(component.previewUrl).toBeNull();
  });

  // ─────────────────────────────────────────────
  // TOGGLE PASSWORD
  // ─────────────────────────────────────────────
  it('should toggle showPassword', () => {
    expect(component.showPassword).toBe(false);
    component.togglePassword();
    expect(component.showPassword).toBe(true);
  });

  it('should toggle showConfirmPassword', () => {
    expect(component.showConfirmPassword).toBe(false);
    component.toggleConfirmPassword();
    expect(component.showConfirmPassword).toBe(true);
  });
});
