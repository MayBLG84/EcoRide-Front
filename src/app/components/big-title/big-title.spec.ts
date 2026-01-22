import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BigTitle } from './big-title';

describe('BigTitle', () => {
  let component: BigTitle;
  let fixture: ComponentFixture<BigTitle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BigTitle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BigTitle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
