import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { BigTitle } from '../../components/big-title/big-title';

@Component({
  selector: 'app-legal-mentions',
  imports: [BigTitle, RouterLink, CommonModule, RouterLinkActive, RouterModule],
  templateUrl: './legal-mentions.html',
  styleUrl: './legal-mentions.scss',
})
export class LegalMentions {}
