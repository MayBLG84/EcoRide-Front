import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BigTitle } from './big-title';
import { By } from '@angular/platform-browser';

describe('BigTitle', () => {
  let component: BigTitle;
  let fixture: ComponentFixture<BigTitle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BigTitle],
    }).compileComponents();

    fixture = TestBed.createComponent(BigTitle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title passed via @Input', () => {
    const testTitle = 'Mon Super Titre';
    component.bigTitle = testTitle;
    fixture.detectChanges();

    const h1 = fixture.nativeElement.querySelector('.big-title') as HTMLElement;
    expect(h1).toBeTruthy();
    expect(h1.textContent).toContain(testTitle);
  });

  it('should have the correct CSS class applied', () => {
    const section = fixture.nativeElement.querySelector('.big-title-container') as HTMLElement;
    const h1 = fixture.nativeElement.querySelector('.big-title') as HTMLElement;

    expect(section).toBeTruthy();
    expect(section.classList).toContain('big-title-container');
    expect(h1.classList).toContain('big-title');
  });
});
