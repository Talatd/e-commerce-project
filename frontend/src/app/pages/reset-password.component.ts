import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services';
import { NexusLogoComponent } from '../nexus-logo.component';
import { NexusThemeToggleComponent } from '../nexus-theme-toggle.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NexusLogoComponent, NexusThemeToggleComponent],
  template: `
<div class="scene">
  <div class="bg-glow-1"></div>
  <div class="bg-grid"></div>
  <div class="card">
    <div class="card-theme-corner">
      <app-nexus-theme-toggle></app-nexus-theme-toggle>
    </div>
    <div class="card-logo">
      <app-nexus-logo size="md" wordmark="Nexus"></app-nexus-logo>
    </div>
    <h1 class="title">New password</h1>
    <p class="sub" *ngIf="token">Choose a new password for your account.</p>
    <p class="error-msg" *ngIf="!token">Invalid or missing reset link. Request a new one from the sign-in page.</p>
    <ng-container *ngIf="token">
      <div class="field">
        <label class="field-label">New password</label>
        <input class="fi" type="password" [(ngModel)]="password" placeholder="Min. 6 characters" (keyup.enter)="submit()" />
      </div>
      <div class="field">
        <label class="field-label">Confirm</label>
        <input class="fi" type="password" [(ngModel)]="confirm" placeholder="Repeat password" (keyup.enter)="submit()" />
      </div>
    </ng-container>
    <p *ngIf="message" class="ok-msg">{{ message }}</p>
    <p *ngIf="error" class="error-msg">{{ error }}</p>
    <button type="button" class="submit" *ngIf="token" (click)="submit()" [disabled]="sending || done">
      <span *ngIf="!sending">Update password</span>
      <span *ngIf="sending">…</span>
    </button>
    <a routerLink="/login" class="back">← Back to sign in</a>
  </div>
</div>
  `,
  styles: [`
    .scene{
      background:#080808; font-family:'Plus Jakarta Sans',sans-serif;
      color:var(--text); min-height:100vh; display:flex; align-items:center; justify-content:center;
      position:relative; padding:24px;
    }
    .bg-glow-1{position:absolute;top:-10%;left:50%;transform:translateX(-50%);width:800px;height:400px;background:radial-gradient(ellipse,rgba(62,207,178,0.08) 0%,transparent 70%);pointer-events:none;}
    .bg-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(62,207,178,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(62,207,178,0.03) 1px,transparent 1px);background-size:64px 64px;pointer-events:none;mask-image:radial-gradient(circle at 50% 50%,black 0%,transparent 80%);}
    .card{width:100%;max-width:420px;background:rgba(15,15,15,0.85);border:1px solid var(--border2);border-radius:24px;padding:40px;position:relative;z-index:2;backdrop-filter:blur(32px);}
    .card-theme-corner{position:absolute;top:18px;right:18px;z-index:4;}
    .card-logo{display:flex;align-items:center;gap:12px;margin-bottom:24px;}
    .title{font-family:'Playfair Display',serif;font-size:26px;font-weight:400;margin:0 0 8px;}
    .sub{font-size:13px;color:var(--text2);margin:0 0 20px;line-height:1.5;}
    .field{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;}
    .field-label{font-size:11px;color:var(--text2);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;}
    .fi{background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:12px;padding:12px 16px;font-size:14px;color:var(--text);width:100%;box-sizing:border-box;outline:none;}
    .fi:focus{border-color:rgba(62,207,178,0.45);box-shadow:inset 0 0 0 1px rgba(62,207,178,0.25);}
    .ok-msg{color:var(--teal);font-size:13px;margin:8px 0 0;}
    .error-msg{color:var(--red);font-size:12px;margin:8px 0 0;}
    .submit{width:100%;margin-top:16px;padding:14px;border-radius:30px;background:linear-gradient(135deg,var(--teal),var(--teal2));color:#040404;font-weight:700;border:none;cursor:pointer;}
    .submit:disabled{opacity:0.6;cursor:wait;}
    .back{display:block;margin-top:20px;font-size:13px;color:var(--teal);text-decoration:none;}
    .back:hover{text-decoration:underline;}
    :host-context(html.light-mode) .scene{background:#F5F2ED;}
    :host-context(html.light-mode) .card{background:rgba(255,255,255,0.94);border-color:rgba(0,0,0,0.1);}
  `],
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  password = '';
  confirm = '';
  message = '';
  error = '';
  sending = false;
  done = false;

  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    this.route.queryParamMap.subscribe((q) => {
      this.token = q.get('token')?.trim() ?? '';
    });
  }

  submit() {
    this.message = '';
    this.error = '';
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }
    if (this.password !== this.confirm) {
      this.error = 'Passwords do not match.';
      return;
    }
    this.sending = true;
    this.auth.resetPassword(this.token, this.password).subscribe({
      next: (res) => {
        this.sending = false;
        this.done = true;
        this.message = res.message || 'Password updated.';
        setTimeout(() => this.router.navigate(['/login']), 2200);
      },
      error: (err) => {
        this.sending = false;
        this.error = err.error?.message || 'Reset failed.';
      },
    });
  }
}
