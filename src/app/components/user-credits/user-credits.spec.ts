import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCredits } from './user-credits';

describe('UserCredits', () => {
  let component: UserCredits;
  let fixture: ComponentFixture<UserCredits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCredits]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserCredits);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
