import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySpace } from './my-space';

describe('MySpace', () => {
  let component: MySpace;
  let fixture: ComponentFixture<MySpace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MySpace]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MySpace);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
