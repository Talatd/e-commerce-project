import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services';
import { NexusLogoComponent } from '../nexus-logo.component';
import { NexusThemeToggleComponent } from '../nexus-theme-toggle.component';
import { CONSUMER_NAV } from '../consumer-nav.paths';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NexusLogoComponent, NexusThemeToggleComponent],
  template: `
<div class="scene">
  <div class="bg-glow-1"></div>
  <div class="bg-glow-2"></div>
  <div class="bg-glow-3"></div>
  <div class="bg-grid"></div>

  <div class="card">
    <div class="card-theme-corner">
      <app-nexus-theme-toggle></app-nexus-theme-toggle>
    </div>
    <div class="card-logo">
      <app-nexus-logo size="md" wordmark="Nexus"></app-nexus-logo>
    </div>

    <!-- TOGGLE -->
    <div class="toggle-wrap" [class.registering]="mode === 'register'">
      <div class="toggle-bg"></div>
      <div class="t-opt" [class.tab-on]="mode === 'login'" (click)="setMode('login')">Sign In</div>
      <div class="t-opt" [class.tab-on]="mode === 'register'" (click)="setMode('register')">Create Account</div>
    </div>

    <!-- HEADLINE -->
    <div class="headline-container">
      <div class="headline" [class.head-on]="mode === 'login'">
        <h1 class="hl-title">Welcome <em>back.</em></h1>
        <p class="hl-sub">Sign in to continue to your account.</p>
      </div>
      <div class="headline" [class.head-on]="mode === 'register'">
        <h1 class="hl-title">Join <em>Nexus</em> today.</h1>
        <p class="hl-sub">Create your free account in seconds.</p>
      </div>
    </div>

    <!-- FORMS -->
    <div class="form-stack">
      <!-- LOGIN -->
      <div class="form-view" [class.view-on]="mode === 'login'">
        <div class="field">
          <label class="field-label">Email Address</label>
          <input class="fi" [(ngModel)]="email" placeholder="you@example.com" type="email"/>
        </div>
        <div class="field">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label class="field-label">Password</label>
            <a routerLink="/forgot-password" class="forgot">Forgot password?</a>
          </div>
          <div class="fi-wrap">
            <input
              class="fi fi--pw"
              [(ngModel)]="password"
              placeholder="••••••••"
              [type]="loginPwVisible ? 'text' : 'password'"
              (keyup.enter)="onLogin()"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="pw-eye"
              (click)="loginPwVisible = !loginPwVisible"
              [attr.aria-pressed]="loginPwVisible"
              [attr.aria-label]="loginPwVisible ? 'Hide password' : 'Show password'"
            >
              <svg *ngIf="!loginPwVisible" class="pw-eye-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg *ngIf="loginPwVisible" class="pw-eye-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>
        
        <p *ngIf="error" class="error-msg">{{error}}</p>

        <button class="submit" type="button" (click)="onLogin()" [disabled]="loginBusy">
          <span class="submit-label" *ngIf="!loginSubmitting">Sign In →</span>
          <span class="submit-spinner" *ngIf="loginSubmitting" aria-hidden="true"></span>
        </button>
        
        <div class="login-div-row">
          <div class="login-div-line"></div>
          <span class="login-div-text">or</span>
          <div class="login-div-line"></div>
        </div>

        <div class="social-row">
          <button type="button" class="soc-btn soc-btn-google" (click)="onGoogleSignIn()" [disabled]="googleBusy" title="Sign in with Google">
            <svg class="soc-ico" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M13 7.1c0-.5 0-.9-.1-1.3H7v2.5h3.4c-.1.8-.6 1.5-1.4 2v1.6h2.2C12.4 10.7 13 9 13 7.1Z" fill="currentColor" opacity="0.85"/>
              <path d="M7 13c1.7 0 3.2-.6 4.2-1.5l-2.1-1.7c-.6.4-1.3.6-2.1.6-1.6 0-3-1.1-3.5-2.6H1.3V9.5C2.3 11.6 4.5 13 7 13Z" fill="currentColor" opacity="0.65"/>
              <path d="M3.5 7.9c-.1-.4-.2-.8-.2-1.2s.1-.8.2-1.2V3.8H1.3C.5 5 0 6.4 0 8s.5 3 1.3 4.2L3.5 7.9Z" fill="currentColor" opacity="0.75"/>
              <path d="M7 2.8c.9 0 1.7.3 2.4 1l1.8-1.8C10.2 1 8.7.5 7 .5 4.5.5 2.3 1.9 1.3 4L3.5 5.7C4 4.2 5.4 2.8 7 2.8Z" fill="currentColor"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      <!-- REGISTER -->
      <div class="form-view" [class.view-on]="mode === 'register'">
        <div class="name-row">
          <div class="field">
            <label class="field-label">First name</label>
            <input class="fi" [(ngModel)]="regFirstName" placeholder="First name" autocomplete="given-name"/>
          </div>
          <div class="field">
            <label class="field-label">Last name</label>
            <input class="fi" [(ngModel)]="regLastName" placeholder="Last name" autocomplete="family-name"/>
          </div>
        </div>
        <div class="field">
          <label class="field-label">Email Address</label>
          <input class="fi" [(ngModel)]="regEmail" placeholder="you@example.com" type="email"/>
        </div>
        <div class="field">
          <label class="field-label">Create Password</label>
          <div class="fi-wrap">
            <input
              class="fi fi--pw"
              [(ngModel)]="regPassword"
              placeholder="Min. 8 characters"
              [type]="regPwVisible ? 'text' : 'password'"
              (input)="pwStrength($event)"
              (keyup.enter)="onRegister()"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="pw-eye"
              (click)="regPwVisible = !regPwVisible"
              [attr.aria-pressed]="regPwVisible"
              [attr.aria-label]="regPwVisible ? 'Hide password' : 'Show password'"
            >
              <svg *ngIf="!regPwVisible" class="pw-eye-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg *ngIf="regPwVisible" class="pw-eye-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <div class="pw-bars">
            <div class="pw-bar" [style.background]="s >= 1 ? c : 'rgba(255,255,255,0.05)'"></div>
            <div class="pw-bar" [style.background]="s >= 2 ? c : 'rgba(255,255,255,0.05)'"></div>
            <div class="pw-bar" [style.background]="s >= 3 ? c : 'rgba(255,255,255,0.05)'"></div>
            <div class="pw-bar" [style.background]="s >= 4 ? c : 'rgba(255,255,255,0.05)'"></div>
          </div>
        </div>

        <p *ngIf="regError" class="error-msg">{{regError}}</p>

        <button class="submit" type="button" (click)="onRegister()" [disabled]="registerBusy">
          <span class="submit-label" *ngIf="!registerSubmitting">Create Account →</span>
          <span class="submit-spinner" *ngIf="registerSubmitting" aria-hidden="true"></span>
        </button>

        <div class="login-div-row">
          <div class="login-div-line"></div>
          <span class="login-div-text">or</span>
          <div class="login-div-line"></div>
        </div>

        <div class="social-row">
          <button type="button" class="soc-btn soc-btn-google" (click)="onGoogleSignIn()" [disabled]="googleBusy" title="Continue with Google">
            <svg class="soc-ico" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M13 7.1c0-.5 0-.9-.1-1.3H7v2.5h3.4c-.1.8-.6 1.5-1.4 2v1.6h2.2C12.4 10.7 13 9 13 7.1Z" fill="currentColor" opacity="0.85"/>
              <path d="M7 13c1.7 0 3.2-.6 4.2-1.5l-2.1-1.7c-.6.4-1.3.6-2.1.6-1.6 0-3-1.1-3.5-2.6H1.3V9.5C2.3 11.6 4.5 13 7 13Z" fill="currentColor" opacity="0.65"/>
              <path d="M3.5 7.9c-.1-.4-.2-.8-.2-1.2s.1-.8.2-1.2V3.8H1.3C.5 5 0 6.4 0 8s.5 3 1.3 4.2L3.5 7.9Z" fill="currentColor" opacity="0.75"/>
              <path d="M7 2.8c.9 0 1.7.3 2.4 1l1.8-1.8C10.2 1 8.7.5 7 .5 4.5.5 2.3 1.9 1.3 4L3.5 5.7C4 4.2 5.4 2.8 7 2.8Z" fill="currentColor"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p class="terms-text">
          By signing up you agree to our <a routerLink="/terms">Terms</a> and <a routerLink="/privacy">Privacy Policy</a>.
        </p>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .scene{
      background:#080808; font-family:'Plus Jakarta Sans',sans-serif;
      color:var(--text); overflow:hidden; width:100%; height:100vh;
      display:flex; align-items:center; justify-content:center;
      position:relative;
    }
    .bg-glow-1{position:absolute;top:-10%;left:50%;transform:translateX(-50%);width:1000px;height:600px;background:radial-gradient(ellipse,rgba(62,207,178,0.08) 0%,transparent 70%);pointer-events:none;}
    .bg-glow-2{position:absolute;bottom:0;left:10%;width:500px;height:500px;background:radial-gradient(circle,rgba(62,207,178,0.05) 0%,transparent 65%);pointer-events:none;}
    .bg-glow-3{position:absolute;bottom:0;right:10%;width:400px;height:400px;background:radial-gradient(circle,rgba(62,207,178,0.03) 0%,transparent 65%);pointer-events:none;}
    .bg-grid{
      position:absolute;inset:0;
      background-image:linear-gradient(rgba(62,207,178,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(62,207,178,0.03) 1px,transparent 1px);
      background-size:64px 64px; pointer-events:none;
      mask-image:radial-gradient(circle at 50% 50%,black 0%,transparent 80%);
    }

    .card{
      width:420px; background:rgba(15,15,15,0.85); border:1px solid var(--border2); border-radius:24px;
      padding:40px; position:relative; z-index:2; backdrop-filter:blur(32px);
      box-shadow:0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.02) inset;
      animation:card-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes card-in{from{opacity:0;transform:translateY(24px) scale(0.98);}to{opacity:1;transform:translateY(0) scale(1);}}
    
    .card-theme-corner{position:absolute;top:18px;right:18px;z-index:4;}
    .card-logo{
      font-family:'Playfair Display',serif;font-style:italic; font-size:24px; color:var(--text);
      display:flex; align-items:center; gap:12px; margin-bottom:32px;
    }
    :host-context(html.light-mode) .scene{background:#F5F2ED;color:#1A1916;}
    :host-context(html.light-mode) .card{
      background:rgba(255,255,255,0.94);border-color:rgba(0,0,0,0.1);
      box-shadow:0 24px 64px rgba(0,0,0,0.1),0 0 0 1px rgba(0,0,0,0.04) inset;
    }

    /* TOGGLE STYLES */
    .toggle-wrap{
      display:flex; background:rgba(0,0,0,0.2); border:1px solid var(--border); border-radius:30px;
      padding:4px; position:relative; margin-bottom:32px;
    }
    .toggle-bg{
      box-sizing:border-box;
      position:absolute; top:4px; bottom:4px; left:4px; width:calc(50% - 4px);
      border-radius:26px; background:rgba(62,207,178,0.08);
      border:1px solid rgba(62,207,178,0.15); z-index:0;
      transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
    }
    .toggle-wrap.registering .toggle-bg { transform: translateX(100%); }
    
    .t-opt{
      flex:1; text-align:center; padding:10px 0; border-radius:26px; font-size:13px; font-weight:600;
      cursor:pointer; position:relative; z-index:1; transition:all 0.3s; color:var(--text3);
    }
    .t-opt.tab-on{ color:var(--teal); }
    .t-opt:hover:not(.tab-on) { color:var(--text2); }

    /* HEADLINE STYLES */
    .headline-container { position: relative; height: 64px; margin-bottom: 24px; }
    .headline {
       position: absolute; inset: 0; opacity: 0; transform: translateY(10px);
       transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .headline.head-on { opacity: 1; transform: translateY(0); }
    .hl-title{ font-family:'Playfair Display',serif; font-size:28px; font-weight:400; color:var(--text); line-height:1.2; }
    .hl-title em{ font-style:italic; color:var(--teal); }
    .hl-sub{ font-size:13px; color:var(--text2); margin-top:6px; font-weight:400; }

    /* FORM STYLES */
    .form-stack { display: flex; flex-direction: column; gap: 16px; }
    .form-view { display: none; animation: fade-in 0.4s ease forwards; gap: 16px; }
    .form-view.view-on { display: flex; flex-direction: column; }
    @keyframes fade-in { from{opacity:0; transform:scale(0.99);} to{opacity:1; transform:scale(1);} }

    .field{display:flex;flex-direction:column;gap:6px;}
    .field-label{font-size:11px;color:var(--text2);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;}
    .fi{
      display:block;
      width:100%;
      max-width:100%;
      background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; padding:12px 16px;
      font-size:14px; color:var(--text); font-family:inherit; outline:none; transition:all 0.3s;
      box-sizing:border-box;
    }
    .fi::placeholder { color: var(--text3); opacity: 0.85; }
    :host-context(html.light-mode) .fi::placeholder { color: #6b6b68; opacity: 1; }
    .fi:focus{
      background:rgba(62,207,178,0.04);
      border-color:rgba(62,207,178,0.45);
      box-shadow: inset 0 0 0 1px rgba(62,207,178,0.25);
    }

    .fi-wrap{
      position:relative;
      display:block;
      width:100%;
      max-width:100%;
      min-width:0;
      align-self:stretch;
    }
    .fi--pw{ padding-right:48px; }
    .pw-eye{
      position:absolute; right:4px; top:50%; transform:translateY(-50%);
      z-index:2; width:38px; height:38px; padding:0; margin:0;
      border:none; border-radius:10px; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      background:transparent;
      color:rgba(255,255,255,0.45);
      transition:color 0.15s ease, background 0.15s ease;
    }
    .pw-eye:hover{ color:rgba(255,255,255,0.92); background:rgba(255,255,255,0.07); }
    .pw-eye:focus-visible{
      outline:2px solid rgba(62,207,178,0.55);
      outline-offset:1px;
    }
    .pw-eye-ico{ width:18px; height:18px; flex-shrink:0; display:block; }
    :host-context(html.light-mode) .pw-eye{
      color:#7a7874;
    }
    :host-context(html.light-mode) .pw-eye:hover{
      color:#2c2b28;
      background:rgba(0,0,0,0.06);
    }
    :host-context(html.light-mode) .pw-eye:focus-visible{
      outline-color:rgba(45,140,120,0.55);
    }
    
    .name-row{display:grid;grid-template-columns:1fr 1fr;gap:12px; min-width:0;}
    .name-row .field { min-width: 0; }
    .forgot{
      font-size:11px;color:var(--text3);cursor:pointer; transition:color 0.2s;
      text-decoration:none;
    }
    .forgot:hover{color:var(--teal);}
    
    .error-msg { color:var(--red); font-size:12px; font-weight:500; margin: -4px 0 4px; }
    
    .submit{
      width:100%; min-height:48px; padding:14px; border-radius:30px; background:linear-gradient(135deg, var(--teal), var(--teal2));
      color:#040404; font-size:14px; font-weight:700; cursor:pointer; border:none; margin-top:8px;
      transition:all 0.3s cubic-bezier(0.19, 1, 0.22, 1); box-shadow:0 4px 15px rgba(62,207,178,0.2);
      display:flex; align-items:center; justify-content:center;
    }
    .submit:hover:not(:disabled){ transform:translateY(-2px); box-shadow:0 8px 25px rgba(62,207,178,0.3); filter:brightness(1.1); }
    .submit:active{ transform:translateY(0) scale(0.98); }
    .submit:disabled{ opacity:0.65; pointer-events:none; }
    .submit-label { display:inline-block; }
    .submit-spinner{
      width:20px;height:20px;border-radius:50%;
      border:2px solid rgba(4,4,4,0.25);border-top-color:#040404;
      animation:spin 0.7s linear infinite;
      margin:0 auto;display:block;
    }

    /* Unique class names — avoid clash with global .divider (e.g. consumer) */
    .login-div-row { display:flex; align-items:center; gap:10px; margin:4px 0 2px; }
    .login-div-line { flex:1; height:1px; background:var(--border); min-width:0; }
    .login-div-text { font-size:11px; color:var(--text3); font-weight:500; text-transform:lowercase; flex-shrink:0; }

    .social-row { display:block; max-width:100%; }
    .soc-btn-google { width:100%; }
    .soc-btn {
      padding:10px 8px; border-radius:9px; background:var(--glass); border:1px solid var(--border);
      color:var(--text2); font-size:12px; font-weight:500; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.15s;
    }
    .soc-btn:hover:not(:disabled) { background:var(--glass2); border-color:var(--border2); color:var(--text); }
    .soc-btn:disabled { opacity:0.65; cursor:wait; }
    .soc-ico {
      width:18px; height:18px; flex-shrink:0; display:block; color:var(--text2);
    }
    :host-context(html.light-mode) .soc-ico { color:#5a6560; }
    
    .terms-text { font-size:11px; color:var(--text3); text-align:center; padding:0 10px; line-height:1.6; }
    .terms-text a { color:var(--text2); cursor:pointer; text-decoration:underline; }

    .pw-bars{display:flex;gap:4px;margin-top:8px;}
    .pw-bar{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,0.06);transition:background 0.25s;min-width:0;}
    :host-context(html.light-mode) .pw-bar{background:rgba(0,0,0,0.06);}
    
    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  mode = 'login';
  s = 0;
  c = 'rgba(255,255,255,0.05)';
  loginSubmitting = false;
  registerSubmitting = false;
  googlePending = false;

  get loginBusy(): boolean {
    return this.loginSubmitting || this.googlePending;
  }
  get registerBusy(): boolean {
    return this.registerSubmitting || this.googlePending;
  }
  get googleBusy(): boolean {
    return this.googlePending || this.loginSubmitting || this.registerSubmitting;
  }

  loginPwVisible = false;
  regPwVisible = false;

  regFirstName = '';
  regLastName = '';
  regEmail = '';
  regPassword = '';
  regError = '';

  auth = inject(AuthService);
  router = inject(Router);

  /** Single-flight load of https://accounts.google.com/gsi/client */
  private gsiScriptPromise: Promise<void> | null = null;

  setMode(m: string) {
    this.mode = m;
    this.error = '';
    this.regError = '';
    this.loginPwVisible = false;
    this.regPwVisible = false;
  }

  pwStrength(event: any) {
    const v = event.target.value || '';
    this.s = 0;
    if (v.length >= 6) this.s++;
    if (v.length >= 10) this.s++;
    if (/[0-9!@#$%^&*]/.test(v)) this.s++;
    if (v.length >= 12 && /[A-Z]/.test(v)) this.s++;
    const colors = ['#E07070', '#E8A94A', '#E8A94A', '#3EC98A'];
    this.c = this.s > 0 ? colors[this.s - 1] : 'rgba(255,255,255,0.05)';
  }

  onLogin() {
    this.loginSubmitting = true;
    this.error = '';

    setTimeout(() => {
      this.auth.login({ email: this.email, password: this.password }).subscribe({
        next: (user) => {
          this.loginSubmitting = false;
          this.afterAuth(user);
        },
        error: () => {
          this.error = 'Invalid credentials. Please try again.';
          this.loginSubmitting = false;
        }
      });
    }, 600);
  }

  onGoogleSignIn() {
    this.error = '';
    this.regError = '';
    const cid = (environment.googleClientId ?? '').trim();
    if (!cid) {
      this.setGoogleError(
        'Google sign-in: add your Web Client ID to environment.googleClientId (Google Cloud Console → OAuth client → Authorized JavaScript origins: http://localhost:4200).'
      );
      return;
    }
    this.googlePending = true;
    this.ensureGsiScript()
      .then(() => {
        const w = window as unknown as { google?: { accounts?: { oauth2?: { initTokenClient: (x: unknown) => { requestAccessToken: () => void } } } } };
        const oauth2 = w.google?.accounts?.oauth2;
        if (!oauth2) {
          this.googlePending = false;
          this.setGoogleError('Google Sign-In script did not initialize.');
          return;
        }
        oauth2
          .initTokenClient({
            client_id: cid,
            scope: 'openid email profile',
            callback: (resp: { error?: string; access_token?: string }) => {
              if (resp.error) {
                this.googlePending = false;
                if (resp.error !== 'popup_closed_by_user') {
                  this.setGoogleError(resp.error || 'Google sign-in failed.');
                }
                return;
              }
              if (!resp.access_token) {
                this.googlePending = false;
                this.setGoogleError('No access token from Google.');
                return;
              }
              this.auth.loginWithGoogleAccessToken(resp.access_token).subscribe({
                next: (user: { role: string }) => {
                  this.googlePending = false;
                  this.afterAuth(user);
                },
                error: (err: { error?: { message?: string }; message?: string }) => {
                  this.googlePending = false;
                  this.setGoogleError(err.error?.message || err.message || 'Google sign-in failed.');
                }
              });
            }
          })
          .requestAccessToken();
      })
      .catch(() => {
        this.googlePending = false;
        this.setGoogleError('Could not load Google Sign-In.');
      });
  }

  /** Show Google errors on the active tab (Sign In vs Create Account). */
  private setGoogleError(msg: string) {
    if (this.mode === 'register') {
      this.regError = msg;
    } else {
      this.error = msg;
    }
  }

  private ensureGsiScript(): Promise<void> {
    if (this.gsiScriptPromise) {
      return this.gsiScriptPromise;
    }
    const w = window as unknown as { google?: { accounts?: { oauth2?: unknown } } };
    if (w.google?.accounts?.oauth2) {
      this.gsiScriptPromise = Promise.resolve();
      return this.gsiScriptPromise;
    }
    this.gsiScriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector('script[data-nexus-gsi="1"]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject());
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.setAttribute('data-nexus-gsi', '1');
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('gsi script'));
      document.head.appendChild(s);
    });
    return this.gsiScriptPromise;
  }

  private afterAuth(user: { role: string }) {
    if (user.role === 'ADMIN') this.router.navigate(['/admin']);
    else if (user.role === 'MANAGER') this.router.navigate(['/manager']);
    else this.router.navigate([CONSUMER_NAV.shop]);
  }

  onRegister() {
    const fullName = `${this.regFirstName} ${this.regLastName}`.trim();
    if (!fullName || !this.regEmail || !this.regPassword) {
      this.regError = 'Please fill in all fields.';
      return;
    }
    if (this.regPassword.length < 6) {
      this.regError = 'Password must be at least 6 characters.';
      return;
    }

    this.registerSubmitting = true;
    this.regError = '';

    this.auth.register({ email: this.regEmail, fullName, passwordHash: this.regPassword }).subscribe({
      next: (user) => {
        this.registerSubmitting = false;
        this.afterAuth(user);
      },
      error: (err) => {
        this.registerSubmitting = false;
        this.regError = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
