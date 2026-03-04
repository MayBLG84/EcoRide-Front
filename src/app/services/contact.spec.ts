import { TestBed } from '@angular/core/testing';
import { ContactService } from './contact';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('ContactService', () => {
  let service: ContactService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ContactService],
    });
    service = TestBed.inject(ContactService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call POST /contact', () => {
    const formData = new FormData();
    formData.append('firstName', 'Jean');

    service.create(formData).subscribe();

    const req = httpMock.expectOne('http://localhost:8000/api/contact');

    expect(req.request.method).toBe('POST');
    req.flush({ status: 'SUCCESS' });
  });
});
