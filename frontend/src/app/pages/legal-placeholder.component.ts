import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

/** Placeholder Terms / Privacy copy — replace with final legal text before production. */
@Component({
  selector: 'app-legal-placeholder',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="legal-scene">
  <div class="legal-card">
    <a routerLink="/login" class="legal-back">← Back to sign in</a>
    <h1 class="legal-title">{{ title }}</h1>
    <p class="legal-body">
      This is placeholder content. Replace with your final legal text before production, or link to an external policy URL.
    </p>
  </div>
</div>
  `,
  styles: [`
    .legal-scene {
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 48px 20px 80px;
      background: #080808;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: var(--text);
    }
    :host-context(html.light-mode) .legal-scene {
      background: #F5F2ED;
      color: #1A1916;
    }
    .legal-card {
      max-width: 560px;
      width: 100%;
      padding: 32px;
      border-radius: 20px;
      border: 1px solid var(--border2);
      background: rgba(15, 15, 15, 0.85);
      backdrop-filter: blur(16px);
    }
    :host-context(html.light-mode) .legal-card {
      background: rgba(255, 255, 255, 0.94);
      border-color: rgba(0, 0, 0, 0.1);
    }
    .legal-back {
      font-size: 13px;
      color: var(--teal);
      text-decoration: none;
      display: inline-block;
      margin-bottom: 20px;
    }
    .legal-back:hover { text-decoration: underline; }
    .legal-title {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 400;
      margin: 0 0 16px;
    }
    .legal-body {
      font-size: 14px;
      line-height: 1.65;
      color: var(--text2);
      margin: 0;
    }
  `],
})
export class LegalPlaceholderComponent {
  title = (inject(ActivatedRoute).snapshot.data['title'] as string) || 'Legal';
}
