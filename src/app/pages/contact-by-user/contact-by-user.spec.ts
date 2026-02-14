import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactByUser } from './contact-by-user';

describe('ContactByUser', () => {
  let component: ContactByUser;
  let fixture: ComponentFixture<ContactByUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactByUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactByUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
