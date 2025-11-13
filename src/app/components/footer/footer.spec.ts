import { render, screen } from '@testing-library/angular';
import { Footer } from './footer';
import { provideRouter } from '@angular/router';
import { Contact } from '../../pages/contact/contact';
import { LegalMentions } from '../../pages/legal-mentions/legal-mentions';

describe('Footer', () => {
  it('should render the footer component', async () => {
    await render(Footer, {
      providers: [
        provideRouter([
          { path: 'contact', component: Contact },
          { path: 'legal-mentions', component: LegalMentions },
        ]),
      ],
    });

    // Checks if the links exist
    const contactLink = screen.getByText('Contact');
    const legalLink = screen.getByText('Mentions légales');
    expect(contactLink).toBeTruthy();
    expect(legalLink).toBeTruthy();

    // Checks if the copyright text exists
    const copyright = screen.getByText(/EcoRide © 2025/);
    expect(copyright).toBeTruthy();
  });
});
