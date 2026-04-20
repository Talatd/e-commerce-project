import { Injectable, signal } from '@angular/core';

/** Syncs `html.light-mode` + `localStorage` for all shells (app layout + standalone pages). */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isLight = signal(false);

  initFromStorage(): void {
    const saved = localStorage.getItem('theme');
    this.apply(saved === 'light');
  }

  toggle(): void {
    this.apply(!this.isLight());
  }

  apply(light: boolean): void {
    this.isLight.set(light);
    document.documentElement.classList.toggle('light-mode', light);
    localStorage.setItem('theme', light ? 'light' : 'dark');
  }
}
