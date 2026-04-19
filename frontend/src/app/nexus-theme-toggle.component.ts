import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from './theme.service';

/** Uses global `.toggle` / `.toggle-thumb` / `.thumb-icon` from `styles.css`. */
@Component({
  selector: 'app-nexus-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toggle" (click)="theme.toggle()" title="Dark / light mode">
      <div class="toggle-thumb">
        <svg *ngIf="!theme.isLight()" class="thumb-icon" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 2C4.2 2 2 4.2 2 7s2.2 5 5 5c1.5 0 2.8-.6 3.8-1.6-3.2 0-5.8-2.6-5.8-5.8 0-1 .3-2 .8-2.8C5.5 2.1 6.2 2 7 2Z" fill="white" />
        </svg>
        <svg *ngIf="theme.isLight()" class="thumb-icon" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="2.8" fill="#2C2C2A" />
          <line x1="7" y1="1" x2="7" y2="2.5" stroke="#2C2C2A" stroke-width="1.2" stroke-linecap="round" />
          <line x1="7" y1="11.5" x2="7" y2="13" stroke="#2C2C2A" stroke-width="1.2" stroke-linecap="round" />
          <line x1="1" y1="7" x2="2.5" y2="7" stroke="#2C2C2A" stroke-width="1.2" stroke-linecap="round" />
          <line x1="11.5" y1="7" x2="13" y2="7" stroke="#2C2C2A" stroke-width="1.2" stroke-linecap="round" />
          <line x1="2.9" y1="2.9" x2="3.9" y2="3.9" stroke="#2C2C2A" stroke-width="1.2" stroke-linecap="round" />
          <line x1="10.1" y1="10.1" x2="11.1" y2="11.1" stroke="#2C2C2A" stroke-width="1.2" stroke-linecap="round" />
          <line x1="11.1" y1="2.9" x2="10.1" y2="3.9" stroke="#2C2C2A" stroke-width="1.2" stroke-linecap="round" />
          <line x1="3.9" y1="10.1" x2="2.9" y2="11.1" stroke="#2C2C2A" stroke-width="1.2" stroke-linecap="round" />
        </svg>
      </div>
    </div>
  `,
})
export class NexusThemeToggleComponent {
  theme = inject(ThemeService);
}
