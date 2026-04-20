import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services';
import { NexusLogoComponent } from '../nexus-logo.component';
import { NexusThemeToggleComponent } from '../nexus-theme-toggle.component';
import { CONSUMER_NAV } from '../consumer-nav.paths';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NexusLogoComponent, NexusThemeToggleComponent],
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
      <div class="t-opt" [class.active]="mode === 'login'" (click)="setMode('login')">Sign In</div>
      <div class="t-opt" [class.active]="mode === 'register'" (click)="setMode('register')">Create Account</div>
    </div>

    <!-- HEADLINE -->
    <div class="headline-container">
      <div class="headline" [class.active]="mode === 'login'">
        <h1 class="hl-title">Welcome <em>back.</em></h1>
        <p class="hl-sub">Sign in to continue to your account.</p>
      </div>
      <div class="headline" [class.active]="mode === 'register'">
        <h1 class="hl-title">Join <em>Nexus</em> today.</h1>
        <p class="hl-sub">Create your free account in seconds.</p>
      </div>
    </div>

    <!-- FORMS -->
    <div class="form-stack">
      <!-- LOGIN -->
      <div class="form-view" [class.active]="mode === 'login'">
        <div class="field">
          <label class="field-label">Email Address</label>
          <input class="fi" [(ngModel)]="email" placeholder="you@example.com" type="email"/>
        </div>
        <div class="field">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label class="field-label">Password</label>
            <span class="forgot">Forgot password?</span>
          </div>
          <input class="fi" [(ngModel)]="password" placeholder="••••••••" type="password" (keyup.enter)="onLogin()"/>
        </div>
        
        <p *ngIf="error" class="error-msg">{{error}}</p>

        <button class="submit" (click)="onLogin()" [disabled]="isLoading">
          <span *ngIf="!isLoading">Sign In →</span>
          <span *ngIf="isLoading" class="spin">◌</span>
        </button>
        
        <div class="divider">
          <div class="divider-line"></div>
          <span class="divider-text">or</span>
          <div class="divider-line"></div>
        </div>

        <div class="social-grid">
          <button class="soc-btn">
             <svg width="16" height="16" viewBox="0 0 24 24">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
             </svg>
             Google
          </button>
          <button class="soc-btn">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
               <path d="M17.05 20.28c-.96.95-2.12 1.44-3.5 1.44-1.38 0-2.54-.49-3.5-1.44-.96-.95-1.44-2.11-1.44-3.48 0-2.73 1.91-5.01 4.54-5.01 1.25 0 2.22.41 2.92.95-.31-.96-.46-1.97-.46-3 0-1.61.41-3.14 1.16-4.5h-.16c-1.38 0-2.54.49-3.5 1.44-.96.95-1.44 2.11-1.44 3.48 0 1.37.48 2.53 1.44 3.48s2.12 1.44 3.5 1.44c.48 0 .94-.06 1.38-.17.38.7.62 1.49.62 2.34 0 1.37-.48 2.53-1.44 3.48z"/>
               <path d="M12.03 5.07c.48 0 .93.18 1.27.5.34.33.53.77.53 1.24 0 .47-.19.91-.53 1.23-.34.33-.79.51-1.27.51-.48 0-.93-.18-1.27-.51a1.69 1.69 0 0 1-.53-1.23c0-.47.19-.91.53-1.24.34-.32.79-.5 1.27-.5zM12.03 1.01c-.11 0-.21.05-.28.14-.07.08-.09.19-.06.29l.71 2.34c.06.21.26.35.48.35h.19c.22 0 .42-.14.48-.35l.71-2.34c.03-.11.01-.22-.06-.3s-.17-.13-.28-.13h-1.89z" opacity="0.5"/>
             </svg>
             Apple
          </button>
        </div>
      </div>

      <!-- REGISTER -->
      <div class="form-view" [class.active]="mode === 'register'">
        <div class="name-row">
          <div class="field">
            <label class="field-label">First name</label>
            <input class="fi" [(ngModel)]="regFirstName" placeholder="Buse"/>
          </div>
          <div class="field">
            <label class="field-label">Last name</label>
            <input class="fi" [(ngModel)]="regLastName" placeholder="U."/>
          </div>
        </div>
        <div class="field">
          <label class="field-label">Email Address</label>
          <input class="fi" [(ngModel)]="regEmail" placeholder="you@example.com" type="email"/>
        </div>
        <div class="field">
          <label class="field-label">Create Password</label>
          <input class="fi" [(ngModel)]="regPassword" placeholder="Min. 8 characters" type="password" (input)="pwStrength($event)" (keyup.enter)="onRegister()"/>
          <div class="pw-bars">
            <div class="pw-bar" [style.background]="s >= 1 ? c : 'rgba(255,255,255,0.05)'"></div>
            <div class="pw-bar" [style.background]="s >= 2 ? c : 'rgba(255,255,255,0.05)'"></div>
            <div class="pw-bar" [style.background]="s >= 3 ? c : 'rgba(255,255,255,0.05)'"></div>
            <div class="pw-bar" [style.background]="s >= 4 ? c : 'rgba(255,255,255,0.05)'"></div>
          </div>
        </div>

        <p *ngIf="regError" class="error-msg">{{regError}}</p>

        <button class="submit" (click)="onRegister()" [disabled]="isLoading">
          <span *ngIf="!isLoading">Create Account →</span>
          <span *ngIf="isLoading" class="spin">◌</span>
        </button>
        <p class="terms-text">
          By signing up you agree to our <a>Terms</a> and <a>Privacy Policy</a>.
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
    .t-opt.active{ color:var(--teal); }
    .t-opt:hover:not(.active) { color:var(--text2); }

    /* HEADLINE STYLES */
    .headline-container { position: relative; height: 64px; margin-bottom: 24px; }
    .headline {
       position: absolute; inset: 0; opacity: 0; transform: translateY(10px);
       transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .headline.active { opacity: 1; transform: translateY(0); }
    .hl-title{ font-family:'Playfair Display',serif; font-size:28px; font-weight:400; color:var(--text); line-height:1.2; }
    .hl-title em{ font-style:italic; color:var(--teal); }
    .hl-sub{ font-size:13px; color:var(--text2); margin-top:6px; font-weight:400; }

    /* FORM STYLES */
    .form-stack { display: flex; flex-direction: column; gap: 16px; }
    .form-view { display: none; animation: fade-in 0.4s ease forwards; gap: 16px; }
    .form-view.active { display: flex; flex-direction: column; }
    @keyframes fade-in { from{opacity:0; transform:scale(0.99);} to{opacity:1; transform:scale(1);} }

    .field{display:flex;flex-direction:column;gap:6px;}
    .field-label{font-size:11px;color:var(--text2);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;}
    .fi{
      background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; padding:12px 16px;
      font-size:14px; color:var(--text); font-family:inherit; outline:none; transition:all 0.3s;
    }
    .fi:focus{ background:rgba(62,207,178,0.03); border-color:rgba(62,207,178,0.4); box-shadow:0 0 0 4px rgba(62,207,178,0.08); }
    
    .name-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    .forgot{font-size:11px;color:var(--text3);cursor:pointer; transition:color 0.2s;}
    .forgot:hover{color:var(--teal);}
    
    .error-msg { color:var(--red); font-size:12px; font-weight:500; margin: -4px 0 4px; }
    
    .submit{
      width:100%; padding:14px; border-radius:30px; background:linear-gradient(135deg, var(--teal), var(--teal2));
      color:#040404; font-size:14px; font-weight:700; cursor:pointer; border:none; margin-top:8px;
      transition:all 0.3s cubic-bezier(0.19, 1, 0.22, 1); box-shadow:0 4px 15px rgba(62,207,178,0.2);
    }
    .submit:hover{ transform:translateY(-2px); box-shadow:0 8px 25px rgba(62,207,178,0.3); filter:brightness(1.1); }
    .submit:active{ transform:translateY(0) scale(0.98); }
    .submit:disabled{ opacity:0.6; pointer-events:none; }

    .divider { display:flex; align-items:center; gap:15px; margin:10px 0; }
    .divider-line { flex:1; height:1px; background:var(--border); }
    .divider-text { font-size:11px; color:var(--text3); font-weight:600; text-transform:uppercase; }

    .social-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .soc-btn {
      padding:12px; border-radius:12px; background:var(--glass); border:1px solid var(--border);
      color:var(--text); font-size:13px; font-weight:500; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition:all 0.2s;
    }
    .soc-btn:hover { background:var(--glass2); border-color:var(--border2); }
    
    .terms-text { font-size:11px; color:var(--text3); text-align:center; padding:0 10px; line-height:1.6; }
    .terms-text a { color:var(--text2); cursor:pointer; text-decoration:underline; }
    
    .spin { animation:spin 1s linear infinite; display:inline-block; font-size:18px; line-height:1; }
    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  `]
})
export class LoginComponent {
  email = 'admin@smartstore.com';
  password = 'admin123';
  error = '';
  mode = 'login';
  s = 0;
  c = 'rgba(255,255,255,0.05)';
  isLoading = false;

  regFirstName = '';
  regLastName = '';
  regEmail = '';
  regPassword = '';
  regError = '';

  auth = inject(AuthService);
  router = inject(Router);

  setMode(m: string) {
    this.mode = m;
    this.error = '';
    this.regError = '';
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
    this.isLoading = true;
    this.error = '';

    setTimeout(() => {
      this.auth.login({ email: this.email, password: this.password }).subscribe({
        next: (user) => {
          this.isLoading = false;
          if (user.role === 'ADMIN') this.router.navigate(['/admin']);
          else if (user.role === 'MANAGER') this.router.navigate(['/manager']);
          else this.router.navigate([CONSUMER_NAV.shop]);
        },
        error: () => {
          this.error = 'Invalid credentials. Please try again.';
          this.isLoading = false;
        }
      });
    }, 600);
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

    this.isLoading = true;
    this.regError = '';

    this.auth.register({ email: this.regEmail, fullName, passwordHash: this.regPassword }).subscribe({
      next: (user) => {
        this.isLoading = false;
        if (user.role === 'ADMIN') this.router.navigate(['/admin']);
        else if (user.role === 'MANAGER') this.router.navigate(['/manager']);
        else this.router.navigate([CONSUMER_NAV.shop]);
      },
      error: (err) => {
        this.isLoading = false;
        this.regError = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
