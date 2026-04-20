import { Component, Input } from '@angular/core';

/** Hex mark + optional wordmark from design preview (`preview/nexus_logo.html`). */
@Component({
  selector: 'app-nexus-logo',
  standalone: true,
  template: `
    <span class="nexus-brand" [class.nexus-brand-sm]="size === 'sm'" [class.nexus-brand-md]="size === 'md'" [class.nexus-brand-lg]="size === 'lg'" [attr.aria-hidden]="wordmark ? null : 'true'">
      <svg class="nexus-svg" viewBox="0 0 44 44" fill="none" aria-hidden="true">
        <circle class="nexus-ring" cx="22" cy="22" r="20" stroke-width="1" />
        <path
          class="nexus-hex"
          d="M22 6L36 14V30L22 38L8 30V14L22 6Z"
          stroke-width="1.2"
          stroke-linejoin="round"
        />
        <path d="M22 6V22M22 22L36 14M22 22L8 14" stroke-width="0.8" opacity="0.5" class="nexus-line" />
        <path d="M22 22V38M22 22L36 30M22 22L8 30" stroke-width="0.8" opacity="0.3" class="nexus-line" />
        <circle cx="22" cy="22" r="3" class="nexus-fill" />
        <circle cx="22" cy="6" r="1.5" class="nexus-fill" opacity="0.6" />
        <circle cx="36" cy="14" r="1.5" class="nexus-fill" opacity="0.6" />
        <circle cx="36" cy="30" r="1.5" class="nexus-fill" opacity="0.4" />
        <circle cx="22" cy="38" r="1.5" class="nexus-fill" opacity="0.4" />
        <circle cx="8" cy="30" r="1.5" class="nexus-fill" opacity="0.4" />
        <circle cx="8" cy="14" r="1.5" class="nexus-fill" opacity="0.6" />
      </svg>
      @if (wordmark) {
        <span class="nexus-divider" aria-hidden="true"></span>
        <span class="nexus-wordmark">{{ wordmark }}</span>
      }
    </span>
  `,
  styles: `
    :host { display: inline-flex; }
    .nexus-brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      cursor: inherit;
    }
    .nexus-brand-sm .nexus-svg { width: 22px; height: 22px; }
    .nexus-brand-md .nexus-svg { width: 28px; height: 28px; }
    .nexus-brand-lg .nexus-svg { width: 36px; height: 36px; }
    /* Explicit colors — color-mix() can fail in some browsers / contexts → invisible logo */
    .nexus-ring {
      stroke: rgba(62, 207, 178, 0.15);
    }
    html.light-mode .nexus-ring {
      stroke: rgba(43, 168, 152, 0.22);
    }
    .nexus-hex {
      stroke: var(--teal, #3ecfb2);
      fill: rgba(62, 207, 178, 0.1);
    }
    html.light-mode .nexus-hex {
      stroke: var(--teal, #2ba898);
      fill: rgba(43, 168, 152, 0.12);
    }
    .nexus-line {
      stroke: var(--teal, #3ecfb2);
    }
    html.light-mode .nexus-line {
      stroke: var(--teal, #2ba898);
    }
    .nexus-fill {
      fill: var(--teal, #3ecfb2);
    }
    .nexus-divider {
      width: 1px;
      height: 22px;
      background: var(--border, rgba(255, 255, 255, 0.1));
      flex-shrink: 0;
    }
    .nexus-wordmark {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 1.05em;
      letter-spacing: 0.02em;
      color: var(--text, #e6f0ee);
    }
    html.light-mode .nexus-wordmark {
      color: var(--text, #1a1916);
    }
  `,
})
export class NexusLogoComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() wordmark = '';
}
