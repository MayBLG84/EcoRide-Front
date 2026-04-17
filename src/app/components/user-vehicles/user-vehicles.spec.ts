import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserVehicles } from './user-vehicles';

describe('UserVehicles', () => {
  let component: UserVehicles;
  let fixture: ComponentFixture<UserVehicles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserVehicles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserVehicles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
