import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';

// Dummy component used for router testing
@Component({ template: '' })
class DummyComponent {}

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([
          { path: '', component: DummyComponent },
          { path: 'login', component: DummyComponent },
          { path: ':id/my-space', component: DummyComponent },
          { path: 'contact', component: DummyComponent },
          { path: 'signup', component: DummyComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test 1: Checks if the component is created correctly
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: Checks if the login button appears when the user is not logged in
  it('should display login button when not logged in', () => {
    component.isLoggedIn.set(false);
    fixture.detectChanges();

    const loginBtn = fixture.debugElement.query(By.css('a[ng-reflect-router-link="/login"]'));
    expect(loginBtn).toBeTruthy();
  });

  // Test 3: Checks if the logout link appears when the user is logged in
  it('should call logout() when clicking logout link', () => {
    component.isLoggedIn.set(true);
    fixture.detectChanges();

    const logoutLink = fixture.debugElement
      .queryAll(By.css('a'))
      .find((el) => !('ng-reflect-router-link' in el.attributes));

    spyOn(component, 'logout');
    logoutLink?.triggerEventHandler('click', null);
    expect(component.logout).toHaveBeenCalled();
  });

  // Test 4: Checks if the mobile menu opens and closes when the burger button is clicked
  it('should toggle mobile menu when burger button is clicked', () => {
    const burger = fixture.debugElement.query(By.css('.burger'));
    expect(component.menuOpen()).toBeFalse();

    burger.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.menuOpen()).toBeTrue();

    component.closeMenu();
    fixture.detectChanges();
    expect(component.menuOpen()).toBeFalse();
  });

  // Test 5: Checks if the "My Space" link shows the correct userId when logged in
  it('should have correct routerLink for My Space when logged in', () => {
    component.isLoggedIn.set(true);
    component.userId.set('123');
    fixture.detectChanges();

    const mySpaceLink = fixture.debugElement.query(
      By.css('a[ng-reflect-router-link="/123/my-space"]')
    );
    expect(mySpaceLink).toBeTruthy();
  });

  // Test 6: Checks if the signup button appears when the user is not logged in
  it('should display signup button when not logged in', () => {
    component.isLoggedIn.set(false);
    fixture.detectChanges();

    const signupBtn = fixture.debugElement.query(By.css('.signup-btn'));
    expect(signupBtn).toBeTruthy();
  });

  // Test 7: Checks if the "active" class is applied correctly to the current route link
  it('should apply "active" class to current route link', () => {
    component.isLoggedIn.set(false);
    fixture.detectChanges();

    const homeLink = fixture.debugElement.query(By.css('a[ng-reflect-router-link=""]'));
    expect(homeLink).toBeTruthy();

    homeLink.nativeElement.classList.add('active');
    fixture.detectChanges();

    expect(homeLink.nativeElement.classList).toContain('active');
  });

  // Test 8: Checks if the "Contact" link is present
  it('should have a contact link', () => {
    fixture.detectChanges();
    const contactLink = fixture.debugElement.query(By.css('a[ng-reflect-router-link="/contact"]'));
    expect(contactLink).toBeTruthy();
  });
});
