import { Component } from '@angular/core';
import { SearchBar } from '../../components/search-bar/search-bar';
import { UserConfiguration } from '../../components/user-configuration/user-configuration';
import { UserCredits } from '../../components/user-credits/user-credits';
import { UserProfile } from '../../components/user-profile/user-profile';
import { UserRides } from '../../components/user-rides/user-rides';
import { UserVehicles } from '../../components/user-vehicles/user-vehicles';

@Component({
  selector: 'app-my-space',
  imports: [SearchBar, UserConfiguration, UserCredits, UserProfile, UserRides, UserVehicles],
  templateUrl: './my-space.html',
  styleUrl: './my-space.scss',
  standalone: true,
})
export class MySpace {}
