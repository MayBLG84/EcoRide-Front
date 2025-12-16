import { TestBed } from '@angular/core/testing';

import { RideParticipation } from './ride-participation';

describe('RideParticipation', () => {
  let service: RideParticipation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RideParticipation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
