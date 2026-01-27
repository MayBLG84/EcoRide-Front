import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Home } from './home';
import { SearchBar } from '../../components/search-bar/search-bar';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  template: '',
})
class SearchBarStub {}

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let component: Home;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home, SearchBarStub],
    })
      .overrideComponent(Home, {
        remove: {
          imports: [SearchBar],
        },
        add: {
          imports: [SearchBarStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the search bar component', () => {
    const searchBarEl = fixture.debugElement.query(By.directive(SearchBarStub));
    expect(searchBarEl).toBeTruthy();
  });

  it('should render the headline section with correct titles', () => {
    const h2 = fixture.nativeElement.querySelector('.headline-container h2');
    const h5 = fixture.nativeElement.querySelector('.headline-container h5');

    expect(h2).toBeTruthy();
    expect(h2.textContent).toContain('Bienvenue à EcoRide');

    expect(h5).toBeTruthy();
    expect(h5.textContent).toContain('Ensemble sur la voie verte');
  });

  it('should render three cards with correct classes', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card-wrapper');
    expect(cards.length).toBe(3);

    expect(cards[0].classList).toContain('card-01');
    expect(cards[1].classList).toContain('card-02');
    expect(cards[2].classList).toContain('card-03');
  });

  it('should have images and icons in each card', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card-wrapper');

    cards.forEach((card: HTMLElement) => {
      const icon = card.querySelector('.icone img') as HTMLImageElement;
      const image = card.querySelector('.image img') as HTMLImageElement;

      expect(icon).toBeTruthy();
      expect(icon.src).toContain('assets/');
      expect(image).toBeTruthy();
      expect(image.src).toContain('assets/');
    });
  });

  it('should have content paragraphs inside each card', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card-wrapper');

    cards.forEach((card: HTMLElement) => {
      const paragraphs = card.querySelectorAll('.content p');
      expect(paragraphs.length).toBeGreaterThan(0);
    });
  });
});
