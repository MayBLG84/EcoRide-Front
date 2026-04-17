import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRides } from './user-rides';

describe('UserRides', () => {
  let component: UserRides;
  let fixture: ComponentFixture<UserRides>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRides]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRides);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
