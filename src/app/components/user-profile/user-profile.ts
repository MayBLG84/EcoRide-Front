import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { UserInfoResponse } from '../../models/user-info-response.model';
import { UserService } from '../../services/user-info';

@Component({
  selector: 'app-user-profile',
  imports: [],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
  standalone: true,
})
export class UserProfile {
  private auth = inject(Auth);
  private router = inject(Router);
  private userService = inject(UserService);

  isHeaderOpen = signal(false);
  user = signal<UserInfoResponse | null>(null);

  isDriver = computed(() => this.auth.isDriver());

  rolesText = computed(() => {
    const roles = this.user()?.roles ?? [];

    const isPassenger = roles.includes('ROLE_PASSENGER');
    const isDriver = roles.includes('ROLE_DRIVER');

    if (isPassenger && isDriver) return 'Passager et Conducteur.trice';
    if (isPassenger) return 'Passager';
    if (isDriver) return 'Conducteur.trice';

    return '';
  });

  hasAddress = computed(() => {
    const addr = this.user()?.address;

    if (!addr) return false;

    return !!(addr.street || addr.number || addr.city || addr.zipcode || addr.country);
  });

  hasComplement = computed(() => {
    const complement = this.user()?.address?.complement;
    return !!complement && complement.trim() !== '';
  });

  loadUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (res) => this.user.set(res),
      error: (err) => console.error(err),
    });
  }

  goToUpdate(): void {
    this.router.navigate(['/user/update']);
  }

  // ─────────────────────────────────────────────
  // UI HELPERS
  // ─────────────────────────────────────────────

  toggleHeader(): void {
    const newValue = !this.isHeaderOpen();
    this.isHeaderOpen.set(newValue);

    if (newValue && !this.user()) {
      this.loadUser();
    }
  }

  public getStarType(starNumber: number, avgRating: number | null): 'full' | 'half' | 'empty' {
    if (avgRating === null) return 'empty';

    const diff = avgRating - starNumber + 1;
    if (diff >= 0.85) return 'full';
    if (diff >= 0.26) return 'half';
    return 'empty';
  }

  private defaultDriverImage = 'assets/user_photo_default.png';

  public getUserImage(user: UserInfoResponse): string {
    if (user.profilePicture instanceof File) {
      return URL.createObjectURL(user.profilePicture);
    }
    return user.profilePicture || this.defaultDriverImage;
  }

  public onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.defaultDriverImage;
  }
}
