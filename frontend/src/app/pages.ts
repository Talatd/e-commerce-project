import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, AiService, ProductService, StoreService, AdminService, OrderService, CategoryService, CustomerProfileService, ToastService } from './services';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="scene">
  <div class="bg-glow-1"></div>
  <div class="bg-glow-2"></div>
  <div class="bg-glow-3"></div>
  <div class="bg-grid"></div>

  <div class="card">
    <div class="card-logo">
      <div class="logo-icon">
        <svg width="24" height="24" viewBox="0 0 44 44" fill="none">
          <path d="M22 4L38 13V31L22 40L6 31V13L22 4Z" stroke="#3ECFB2" stroke-width="2" fill="rgba(62,207,178,0.1)"/>
          <circle cx="22" cy="22" r="4" fill="#3ECFB2">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      Nexus
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
    
    .card-logo{
      font-family:'Playfair Display',serif;font-style:italic; font-size:24px; color:var(--text);
      display:flex; align-items:center; gap:12px; margin-bottom:32px;
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
          else this.router.navigate(['/consumer']);
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
        else this.router.navigate(['/consumer']);
      },
      error: (err) => {
        this.isLoading = false;
        this.regError = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
@Component({
  selector: 'app-consumer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;1,400&family=JetBrains+Mono:wght@400&display=swap');
:host {
  --bg:#080808;--glass:rgba(255,255,255,0.04);--glass2:rgba(255,255,255,0.07);
  --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.12);
  --teal:#3ECFB2;--teal2:#6EDEC8;--teal-dim:rgba(62,207,178,0.1);--teal-glow:rgba(62,207,178,0.18);
  --text:#E6F0EE;--text2:#6A8A84;--text3:#344844;
  --green:#3EC98A;--green-dim:rgba(62,201,138,0.08);--green-border:rgba(62,201,138,0.2);
  --red:#E07070;--red-dim:rgba(224,112,112,0.08);--red-border:rgba(224,112,112,0.2);
  --amber:#E8A94A;--amber-dim:rgba(232,169,74,0.08);
  --blue:#6BA8C8;--blue-dim:rgba(107,168,200,0.08);
  --purple:#A78BCC;
}

.page{background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--text);overflow:hidden;display:flex;flex-direction:column;height:100vh;}

/* NAVBAR */
.navbar{display:flex;align-items:center;justify-content:space-between;padding:12px 24px;border-bottom:1px solid var(--border);background:rgba(8,8,8,0.93);backdrop-filter:blur(20px);flex-shrink:0;z-index:50;}
.logo{font-family:'Playfair Display',serif;font-style:italic;font-size:19px;color:var(--text);display:flex;align-items:center;gap:7px;cursor:pointer;}
.logo-dot{width:7px;height:7px;border-radius:50%;background:var(--teal);box-shadow:0 0 8px var(--teal-glow);}
.nav-pills{display:flex;gap:2px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:28px;padding:3px;}
.npill{padding:6px 14px;border-radius:20px;font-size:12px;color:var(--text2);cursor:pointer;transition:all 0.15s;}
.npill.active{background:var(--teal-dim);color:var(--teal2);border:1px solid rgba(62,207,178,0.18);}
.nav-r{display:flex;align-items:center;gap:8px;}
.nav-icon{width:34px;height:34px;border-radius:50%;background:var(--glass);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;transition:border-color 0.15s;}
.nav-icon:hover{border-color:var(--border2);}
.nb{position:absolute;top:-2px;right:-2px;width:15px;height:15px;border-radius:50%;background:var(--teal);color:#080808;font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid var(--bg);}
.user-pill{display:flex;align-items:center;gap:7px;padding:4px 12px 4px 4px;border-radius:20px;background:var(--glass);border:1px solid var(--border2);cursor:pointer;}
.uav{width:26px;height:26px;border-radius:50%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.25);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:var(--teal);}

/* MAIN SCROLL */
.main-scroll{flex:1;overflow-y:auto;}
.main-scroll::-webkit-scrollbar{width:2px;}
.main-scroll::-webkit-scrollbar-thumb{background:var(--border2);}

/* === HOME TAB === */
.hero{padding:40px 24px 32px;position:relative;overflow:hidden;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:32px;}
.hero-bg1{position:absolute;top:-60px;left:-40px;width:400px;height:300px;background:radial-gradient(ellipse,rgba(62,207,178,0.07),transparent 65%);pointer-events:none;}
.hero-bg2{position:absolute;bottom:-40px;right:10%;width:280px;height:280px;background:radial-gradient(circle,rgba(107,168,200,0.04),transparent 65%);pointer-events:none;}
.bg-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(62,207,178,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(62,207,178,0.025) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;mask-image:radial-gradient(ellipse 80% 100% at 30% 50%,black 0%,transparent 100%);}
.hero-left{flex:1;position:relative;z-index:1;}
.hero-greeting{display:inline-flex;align-items:center;gap:6px;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);color:var(--teal2);font-size:11px;padding:5px 14px;border-radius:20px;margin-bottom:16px;letter-spacing:0.04em;}
.greet-dot{width:5px;height:5px;border-radius:50%;background:var(--teal);animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
.hero-title{font-family:'Playfair Display',serif;font-size:38px;font-weight:400;color:var(--text);line-height:1.1;letter-spacing:-0.02em;margin-bottom:12px;}
.hero-title em{font-style:italic;color:var(--teal2);}
.hero-sub{font-size:13.5px;color:var(--text2);line-height:1.7;max-width:400px;font-weight:300;margin-bottom:24px;}
.hero-cta{display:flex;gap:10px;}
.btn-primary{padding:11px 26px;border-radius:24px;background:var(--teal);color:#080808;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s;}
.btn-primary:hover{background:var(--teal2);transform:translateY(-1px);box-shadow:0 8px 22px rgba(62,207,178,0.2);}
.btn-ghost{padding:11px 26px;border-radius:24px;background:transparent;color:var(--text2);font-size:13px;cursor:pointer;border:1px solid var(--border2);font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s;}
.btn-ghost:hover{color:var(--text);border-color:rgba(255,255,255,0.2);}
.hero-right{display:flex;flex-direction:column;gap:8px;position:relative;z-index:1;flex-shrink:0;}
.hero-stat{background:rgba(12,12,12,0.9);border:1px solid var(--border2);border-radius:10px;padding:10px 16px;display:flex;align-items:center;gap:10px;backdrop-filter:blur(8px);animation:float 4s ease-in-out infinite;}
.hero-stat:nth-child(2){animation-delay:1.2s;}
.hero-stat:nth-child(3){animation-delay:2.4s;}
@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}
.hs-icon{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.hs-val{font-family:'Playfair Display',serif;font-size:16px;color:var(--text);line-height:1;}
.hs-val em{font-style:italic;color:var(--teal2);}
.hs-label{font-size:10px;color:var(--text3);margin-top:1px;}

.quick-section{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;gap:10px;overflow-x:auto;}
.quick-section::-webkit-scrollbar{display:none;}
.qlink{display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 20px;border-radius:12px;background:var(--glass);border:1px solid var(--border);cursor:pointer;transition:all 0.2s;flex-shrink:0;min-width:80px;}
.qlink:hover{background:var(--glass2);border-color:rgba(62,207,178,0.15);transform:translateY(-2px);}
.ql-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;}
.ql-label{font-size:11.5px;color:var(--text2);font-weight:500;white-space:nowrap;}

.flash-section{padding:20px 24px;border-bottom:1px solid var(--border);}
.flash-banner{background:linear-gradient(135deg,rgba(62,207,178,0.08) 0%,rgba(107,168,200,0.05) 100%);border:1px solid rgba(62,207,178,0.15);border-radius:14px;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;position:relative;overflow:hidden;}
.flash-banner::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(62,207,178,0.35),transparent);}
.fb-left{display:flex;align-items:center;gap:16px;}
.fb-icon{width:44px;height:44px;border-radius:12px;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.fb-title{font-family:'Playfair Display',serif;font-size:18px;font-style:italic;color:var(--text);margin-bottom:3px;}
.fb-sub{font-size:12px;color:var(--text2);font-weight:300;}
.fb-timer{display:flex;align-items:center;gap:6px;font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--teal2);}
.fb-unit{background:rgba(62,207,178,0.08);border:1px solid rgba(62,207,178,0.15);border-radius:6px;padding:4px 8px;}
.fb-sep{color:var(--text3);}
.fb-btn{padding:10px 22px;border-radius:20px;background:var(--teal);color:#080808;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s;flex-shrink:0;}
.fb-btn:hover{background:var(--teal2);}

.sec-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:14px;}
.sec-title{font-family:'Playfair Display',serif;font-size:20px;font-style:italic;color:var(--text);}
.sec-sub{font-size:11px;color:var(--text3);margin-top:3px;}
.sec-link{font-size:12px;color:var(--text3);cursor:pointer;transition:color 0.15s;}
.sec-link:hover{color:var(--teal2);}

.continue-section{padding:20px 24px;border-bottom:1px solid var(--border);}
.continue-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
.cs-card{background:var(--glass);border:1px solid var(--border);border-radius:10px;overflow:hidden;cursor:pointer;transition:border-color 0.15s,transform 0.2s;display:flex;align-items:center;gap:10px;padding:10px 12px;}
.cs-card:hover{border-color:rgba(62,207,178,0.15);transform:translateY(-1px);}
.cs-img{width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--border);}
.cs-name{font-size:12px;font-weight:500;color:var(--text);margin-bottom:2px;line-height:1.3;}
.cs-progress-wrap{display:flex;align-items:center;gap:6px;margin-top:4px;}
.cs-progress{flex:1;height:2px;background:rgba(255,255,255,0.06);border-radius:1px;overflow:hidden;}
.cs-fill{height:100%;background:var(--teal);border-radius:1px;}
.cs-pct{font-size:9.5px;color:var(--text3);font-family:'JetBrains Mono',monospace;}

.trending-section{padding:20px 24px;border-bottom:1px solid var(--border);}
.categories-section{padding:20px 24px;}
.cat-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;}
.cat-card{background:var(--glass);border:1px solid var(--border);border-radius:11px;padding:16px 10px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;transition:all 0.2s;text-align:center;}
.cat-card:hover{background:var(--glass2);border-color:rgba(62,207,178,0.15);transform:translateY(-2px);}
.cat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;}
.cat-name{font-size:11.5px;color:var(--text2);font-weight:500;}
.cat-count{font-size:9px;color:var(--text3);font-family:'JetBrains Mono',monospace;}

/* === SHOP TAB === */
.search-hero{padding:28px 24px 0;background:linear-gradient(180deg,rgba(62,207,178,0.04) 0%,transparent 100%);border-bottom:1px solid var(--border);position:relative;overflow:hidden;}
.sh-glow{position:absolute;top:-60px;left:50%;transform:translateX(-50%);width:500px;height:200px;background:radial-gradient(ellipse,rgba(62,207,178,0.06),transparent 70%);pointer-events:none;}
.sh-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;position:relative;z-index:1;}
.sh-title{font-family:'Playfair Display',serif;font-size:22px;font-style:italic;color:var(--text);}
.sh-sub{font-size:12px;color:var(--text3);margin-top:3px;}
.search-bar{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.05);border:1px solid var(--border2);border-radius:12px;padding:11px 16px;margin-bottom:16px;position:relative;z-index:1;transition:border-color 0.2s,box-shadow 0.2s;}
.search-bar:focus-within{border-color:rgba(62,207,178,0.3);box-shadow:0 0 0 3px rgba(62,207,178,0.05);}
.search-bar input{flex:1;background:transparent;border:none;outline:none;font-size:14px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;caret-color:var(--teal);}
.search-bar input::placeholder{color:var(--text3);}
.search-count{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3);white-space:nowrap;}
.cat-row{display:flex;gap:7px;padding-bottom:16px;overflow-x:auto;position:relative;z-index:1;}
.cat-row::-webkit-scrollbar{display:none;}
.cat-pill{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;font-size:12px;cursor:pointer;border:1px solid var(--border);background:var(--glass);color:var(--text2);transition:all 0.15s;white-space:nowrap;flex-shrink:0;}
.cat-pill.active{background:var(--teal-dim);color:var(--teal2);border-color:rgba(62,207,178,0.2);}
.cat-pill:not(.active):hover{background:var(--glass2);color:var(--text);}

.shop-body{display:flex;flex:1;min-height:500px;}
.filter-sidebar{width:210px;min-width:210px;border-right:1px solid var(--border);padding:16px 12px;transition:width 0.35s cubic-bezier(0.4,0,0.2,1),min-width 0.35s,opacity 0.25s;overflow-y:auto;}
.filter-sidebar.collapsed{width:0;min-width:0;opacity:0;overflow:hidden;padding:0;}
.fs-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.fs-title{font-size:10px;letter-spacing:0.13em;text-transform:uppercase;color:var(--text2);font-weight:500;}
.fs-clear{font-size:10px;color:var(--text3);cursor:pointer;transition:color 0.15s;}
.fs-clear:hover{color:var(--red);}
.fsec{margin-bottom:18px;}
.fsec-label{font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text3);margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;}
.fsec-body{display:flex;flex-direction:column;gap:4px;}
.fcheck{display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:7px;cursor:pointer;transition:background 0.12s;}
.fcheck:hover{background:var(--glass);}
.fbox{width:15px;height:15px;border-radius:4px;border:1px solid var(--border2);flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
.fcheck.on .fbox{background:var(--teal-dim);border-color:rgba(62,207,178,0.3);}
.flabel{font-size:12px;color:var(--text2);transition:color 0.15s;}
.fcheck.on .flabel{color:var(--text);}
.fcount{margin-left:auto;font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace;}
.price-inputs{display:flex;align-items:center;gap:6px;margin-top:6px;}
.pinput{flex:1;background:var(--glass);border:1px solid var(--border);border-radius:7px;padding:7px 9px;font-size:11.5px;color:var(--text);font-family:'JetBrains Mono',monospace;outline:none;width:100%;transition:border-color 0.2s;}
.pinput:focus{border-color:rgba(62,207,178,0.28);}
.psep{font-size:11px;color:var(--text3);}
.rating-opts{display:flex;flex-direction:column;gap:4px;}
.ropt{display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:7px;cursor:pointer;transition:background 0.12s;}
.ropt:hover{background:var(--glass);}
.ropt.sel{background:var(--teal-dim);}
.rstar{font-size:11px;color:var(--amber);}
.rstare{font-size:11px;color:var(--text3);}
.rlabel{font-size:11.5px;color:var(--text2);}

.products-area{flex:1;padding:16px 18px;overflow-y:auto;}
.products-area::-webkit-scrollbar{width:2px;}
.products-area::-webkit-scrollbar-thumb{background:var(--border2);}
.active-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;min-height:0;}
.achip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;background:var(--teal-dim);color:var(--teal2);border:1px solid rgba(62,207,178,0.2);}
.achip-x{cursor:pointer;opacity:0.7;font-size:13px;line-height:1;}
.results-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.rb-count{font-size:12px;color:var(--text2);}
.rb-count span{color:var(--text);font-weight:500;}
.rb-sort{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--text2);background:var(--glass);border:1px solid var(--border);border-radius:20px;padding:5px 13px;cursor:pointer;}

.prod-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.pcard{background:var(--glass);border:1px solid var(--border);border-radius:12px;overflow:hidden;cursor:pointer;transition:border-color 0.2s,transform 0.2s;position:relative;}
.pcard:hover{border-color:rgba(62,207,178,0.2);transform:translateY(-3px);}
.pcard:hover .pc-quick{opacity:1;}
.pcard:hover .pc-wish{opacity:1;}
.pc-img{aspect-ratio:1.1;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--border);position:relative;overflow:hidden;}
.pc-img-glow{position:absolute;inset:0;opacity:0;transition:opacity 0.3s;pointer-events:none;}
.pcard:hover .pc-img-glow{opacity:1;}
.pc-badges{position:absolute;top:8px;left:8px;display:flex;flex-direction:column;gap:4px;}
.pc-badge{font-size:9px;padding:2px 8px;border-radius:8px;font-weight:600;}
.b-new{background:var(--teal-dim);color:var(--teal2);border:1px solid rgba(62,207,178,0.2);}
.b-sale{background:rgba(224,112,112,0.1);color:var(--red);border:1px solid rgba(224,112,112,0.18);}
.b-hot{background:rgba(232,169,74,0.1);color:var(--amber);border:1px solid rgba(232,169,74,0.18);}
.pc-wish{position:absolute;top:8px;right:8px;width:26px;height:26px;border-radius:50%;background:rgba(8,8,8,0.7);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--text3);opacity:0;transition:opacity 0.2s;cursor:pointer;z-index:5;}
.pc-wish:hover{color:var(--red);border-color:rgba(224,112,112,0.3);}
.pc-quick{position:absolute;bottom:0;left:0;right:0;padding:10px;background:linear-gradient(0deg,rgba(8,8,8,0.9) 0%,transparent 100%);opacity:0;transition:opacity 0.2s;display:flex;gap:6px;z-index:4;}
.pc-quick-btn{flex:1;padding:7px 0;border-radius:20px;background:var(--teal);color:#080808;font-size:11px;font-weight:600;cursor:pointer;border:none;font-family:'Plus Jakarta Sans',sans-serif;transition:background 0.15s;text-align:center;}
.pc-quick-btn:hover{background:var(--teal2);}
.pc-body{padding:11px 13px;}
.pc-brand{font-size:8.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:3px;}
.pc-name{font-size:13px;font-weight:500;color:var(--text);margin-bottom:5px;line-height:1.3;}
.pc-stars{display:flex;align-items:center;gap:5px;margin-bottom:7px;}
.pc-star{color:var(--amber);font-size:10px;}
.pc-rcount{font-size:10px;color:var(--text3);}
.pc-bottom{display:flex;align-items:center;justify-content:space-between;}
.pc-price{font-family:'Playfair Display',serif;font-size:16px;color:var(--text);}
.pc-price-old{font-size:11px;color:var(--text3);text-decoration:line-through;margin-left:5px;}
.pc-stock{font-size:10px;padding:2px 7px;border-radius:8px;}
.pc-instock{background:var(--green-dim);color:var(--green);border:1px solid rgba(62,201,138,0.18);}
.pc-lowstock{background:rgba(232,169,74,0.08);color:var(--amber);border:1px solid rgba(232,169,74,0.18);}
.filter-toggle{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:20px;font-size:12px;cursor:pointer;background:var(--glass);border:1px solid var(--border2);color:var(--text2);transition:all 0.15s;font-family:'Plus Jakarta Sans',sans-serif;}
.filter-toggle:hover{color:var(--text);}
.filter-toggle.active{background:var(--teal-dim);color:var(--teal2);border-color:rgba(62,207,178,0.2);}
.ft-badge{background:var(--teal);color:#080808;width:16px;height:16px;border-radius:50%;font-size:9px;font-weight:700;display:none;align-items:center;justify-content:center;}
.ft-badge.show{display:flex;}

/* === WISHLIST TAB === */
.page-header{padding:28px 24px 0;}
.ph-top{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:16px;}
.ph-title{font-family:'Playfair Display',serif;font-size:28px;font-style:italic;color:var(--text);}
.ph-sub{font-size:12px;color:var(--text3);margin-top:4px;}
.ph-actions{display:flex;gap:8px;align-items:center;}
.ph-btn{padding:8px 18px;border-radius:20px;font-size:12px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.15s;}
.ph-ghost{background:var(--glass);border:1px solid var(--border2);color:var(--text2);}
.ph-ghost:hover{color:var(--text);}
.ph-teal{background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);color:var(--teal2);}
.filter-row{display:flex;align-items:center;gap:7px;padding:0 24px 18px;flex-wrap:wrap;}
.fchip{padding:5px 14px;border-radius:20px;font-size:11.5px;cursor:pointer;border:1px solid var(--border);background:var(--glass);color:var(--text2);transition:all 0.15s;}
.fchip.active{background:var(--teal-dim);color:var(--teal2);border-color:rgba(62,207,178,0.2);}
.fchip:not(.active):hover{color:var(--text);}
.wish-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 24px 24px;}
.wcard{background:var(--glass);border:1px solid var(--border);border-radius:12px;overflow:hidden;cursor:pointer;transition:border-color 0.2s,transform 0.2s;position:relative;}
.wcard:hover{border-color:rgba(62,207,178,0.15);transform:translateY(-2px);}
.wc-img{aspect-ratio:1.2;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--border);position:relative;overflow:hidden;}
.wc-glow{position:absolute;inset:0;opacity:0;transition:opacity 0.3s;pointer-events:none;}
.wcard:hover .wc-glow{opacity:1;}
.wc-top-badges{position:absolute;top:8px;left:8px;right:8px;display:flex;align-items:flex-start;justify-content:space-between;}
.wc-badge{font-size:9px;padding:2px 8px;border-radius:8px;font-weight:600;}
.b-low{background:rgba(232,169,74,0.1);color:var(--amber);border:1px solid rgba(232,169,74,0.18);}
.wc-remove{width:26px;height:26px;border-radius:50%;background:rgba(8,8,8,0.75);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--text3);opacity:0;transition:all 0.2s;cursor:pointer;line-height:1;}
.wcard:hover .wc-remove{opacity:1;}
.wc-remove:hover{color:var(--red);border-color:rgba(224,112,112,0.3);}
.wc-body{padding:12px 14px;}
.wc-cat{font-size:8.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:3px;}
.wc-name{font-size:13px;font-weight:500;color:var(--text);margin-bottom:4px;line-height:1.3;}
.wc-price-row{display:flex;align-items:baseline;gap:7px;margin-bottom:8px;}
.wc-price{font-family:'Playfair Display',serif;font-size:17px;color:var(--text);}
.wc-price-old{font-size:12px;color:var(--text3);text-decoration:line-through;}
.wc-drop{font-size:10px;background:var(--green-dim);color:var(--green);padding:2px 7px;border-radius:8px;border:1px solid rgba(62,201,138,0.18);}
.wc-meta{display:flex;align-items:center;gap:6px;margin-bottom:10px;}
.wc-stars{font-size:10px;color:var(--amber);}
.wc-rating{font-size:10.5px;color:var(--text3);}
.wc-saved{font-size:10px;color:var(--text3);margin-left:auto;}
.wc-actions{display:flex;gap:6px;}
.wc-cart{flex:1;padding:8px 0;border-radius:20px;background:var(--teal);color:#080808;font-size:12px;font-weight:600;cursor:pointer;border:none;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s;text-align:center;}
.wc-cart:hover{background:var(--teal2);}
.wc-more{width:34px;height:34px;border-radius:50%;background:var(--glass2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;font-size:13px;color:var(--text2);}
.wc-more:hover{color:var(--text);}
.alert-banner{display:flex;align-items:center;gap:12px;background:var(--green-dim);border:1px solid rgba(62,201,138,0.18);border-radius:10px;padding:12px 16px;margin:0 24px 16px;}
.ab-icon{width:32px;height:32px;border-radius:8px;background:rgba(62,201,138,0.1);border:1px solid rgba(62,201,138,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ab-text{flex:1;font-size:12.5px;color:var(--text2);line-height:1.5;}
.ab-text strong{color:var(--green);}
.ab-btn{padding:6px 14px;border-radius:20px;font-size:11.5px;background:rgba(62,201,138,0.12);border:1px solid rgba(62,201,138,0.2);color:var(--green);cursor:pointer;white-space:nowrap;font-family:'Plus Jakarta Sans',sans-serif;}

/* === ORDERS TAB === */
.orders-content{padding:24px;}
.page-head-orders{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:20px;}
.summary-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:20px;}
.sb-item{background:var(--bg);padding:14px 0;text-align:center;}
.sb-val{font-family:'Playfair Display',serif;font-size:20px;color:var(--text);line-height:1;margin-bottom:3px;}
.sb-val em{font-style:italic;color:var(--teal2);}
.sb-label{font-size:9.5px;letter-spacing:0.08em;text-transform:uppercase;color:var(--text3);}
.toolbar{display:flex;gap:8px;margin-bottom:20px;align-items:center;flex-wrap:wrap;}
.search-box{flex:1;min-width:200px;display:flex;align-items:center;gap:8px;background:var(--glass);border:1px solid var(--border2);border-radius:10px;padding:9px 14px;}
.search-box input{flex:1;background:transparent;border:none;outline:none;font-size:13px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;}
.search-box input::placeholder{color:var(--text3);}
.filter-chips{display:flex;gap:6px;flex-wrap:wrap;}
.orders{display:flex;flex-direction:column;gap:10px;}
.ocard{background:var(--glass);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:border-color 0.15s;}
.ocard:hover{border-color:var(--border2);}
.oc-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.04);}
.och-left{display:flex;align-items:center;gap:16px;}
.oc-id{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--teal);opacity:0.8;}
.oc-date{font-size:11.5px;color:var(--text3);}
.oc-items-count{font-size:11px;color:var(--text3);}
.och-right{display:flex;align-items:center;gap:12px;}
.oc-total{font-family:'Playfair Display',serif;font-size:17px;color:var(--text);}
.spill{display:inline-flex;align-items:center;gap:4px;font-size:10px;padding:3px 9px;border-radius:10px;font-weight:500;}
.sp-g{background:var(--green-dim);color:var(--green);border:1px solid var(--green-border);}
.sp-b{background:var(--blue-dim);color:var(--blue);border:1px solid rgba(107,168,200,0.18);}
.sp-a{background:var(--amber-dim);color:var(--amber);border:1px solid rgba(232,169,74,0.18);}
.sp-r{background:var(--red-dim);color:var(--red);border:1px solid rgba(224,112,112,0.18);}
.oc-items-row{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.03);}
.oi-img{width:40px;height:40px;border-radius:8px;background:var(--glass2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.oi-info{flex:1;min-width:0;}
.oi-name{font-size:13px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.oi-var{font-size:11px;color:var(--text3);}
.oi-qty{font-size:11px;color:var(--text3);white-space:nowrap;margin:0 8px;}
.oi-price{font-family:'Playfair Display',serif;font-size:15px;color:var(--text);flex-shrink:0;}
.oc-actions{display:flex;gap:7px;padding:11px 16px;}
.oa-btn{padding:6px 16px;border-radius:20px;font-size:11.5px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.15s;}
.oa-ghost{background:var(--glass2);border:1px solid var(--border);color:var(--text2);}
.oa-ghost:hover{color:var(--text);}
.oa-teal{background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);color:var(--teal2);}
.oa-teal:hover{background:var(--teal);color:#080808;border-color:var(--teal);}

/* === PRODUCT DETAIL === */
.product-section{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--border);}
.img-col{padding:24px;border-right:1px solid var(--border);}
.main-img{width:100%;aspect-ratio:1;border-radius:12px;background:rgba(62,207,178,0.04);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;margin-bottom:12px;position:relative;overflow:hidden;}
.img-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:200px;height:200px;background:radial-gradient(circle,rgba(62,207,178,0.07),transparent 70%);pointer-events:none;}
.img-badge{position:absolute;top:12px;left:12px;font-size:9px;padding:3px 9px;border-radius:10px;font-weight:600;}
.thumb-row{display:flex;gap:8px;}
.thumb{width:52px;height:52px;border-radius:8px;background:var(--glass);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:border-color 0.15s;}
.thumb.active{border-color:rgba(62,207,178,0.35);}
.thumb:hover{border-color:var(--border2);}
.info-col{padding:24px;}
.prod-brand{font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--teal);margin-bottom:7px;}
.prod-name{font-family:'Playfair Display',serif;font-size:26px;font-weight:400;color:var(--text);line-height:1.15;margin-bottom:10px;letter-spacing:-0.01em;}
.rating-row{display:flex;align-items:center;gap:8px;margin-bottom:14px;}
.stars{display:flex;gap:2px;}
.star{width:13px;height:13px;}
.rating-val{font-size:13px;color:var(--text);font-weight:500;}
.rating-count{font-size:12px;color:var(--text3);}
.price-row{display:flex;align-items:baseline;gap:10px;margin-bottom:6px;}
.price{font-family:'Playfair Display',serif;font-size:30px;color:var(--text);line-height:1;}
.price-old{font-size:16px;color:var(--text3);text-decoration:line-through;}
.price-save{font-size:11px;background:var(--green-dim);color:var(--green);padding:3px 9px;border-radius:10px;border:1px solid var(--green-border);}
.stock-row-detail{display:flex;align-items:center;gap:6px;margin-bottom:18px;}
.stock-dot-detail{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 5px rgba(62,201,138,0.4);}
.stock-txt{font-size:12px;color:var(--green);}
.divider{height:1px;background:var(--border);margin:14px 0;}
.var-label{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:7px;}
.var-row{display:flex;gap:6px;margin-bottom:13px;}
.var{padding:6px 13px;border-radius:20px;font-size:12px;cursor:pointer;border:1px solid var(--border);color:var(--text2);transition:all 0.15s;}
.var.active{background:var(--teal-dim);color:var(--teal2);border-color:rgba(62,207,178,0.2);}
.var:hover{border-color:var(--border2);color:var(--text);}
.action-row{display:flex;align-items:center;gap:8px;}
.qty-box{display:flex;align-items:center;background:var(--glass);border:1px solid var(--border2);border-radius:20px;overflow:hidden;}
.qty-btn{width:32px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;color:var(--text2);transition:all 0.15s;}
.qty-btn:hover{color:var(--text);background:var(--glass2);}
.qty-val{width:28px;text-align:center;font-size:13px;color:var(--text);}
.add-btn{flex:1;padding:10px 0;border-radius:20px;background:var(--teal);color:#080808;font-size:13px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;border:none;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:7px;}
.add-btn:hover{background:var(--teal2);transform:translateY(-1px);box-shadow:0 6px 20px rgba(62,207,178,0.2);}
.wish-btn{width:38px;height:38px;border-radius:50%;background:var(--glass);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;}
.wish-btn:hover{border-color:rgba(224,112,112,0.3);color:var(--red);}
.specs-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:14px;}
.spec{background:var(--glass);border:1px solid var(--border);border-radius:8px;padding:8px 11px;}
.spec-key{font-size:8.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:2px;}
.spec-val{font-size:12px;color:var(--text);font-weight:500;}

/* SENTIMENT */
.sentiment-section{padding:24px;}
.ai-powered{display:inline-flex;align-items:center;gap:6px;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);border-radius:20px;padding:5px 13px;font-size:11px;color:var(--teal2);margin-bottom:20px;}
.ai-dot{width:5px;height:5px;border-radius:50%;background:var(--teal);animation:pulse 2s infinite;}
.sentiment-overview{display:grid;grid-template-columns:200px 1fr;gap:16px;margin-bottom:20px;}
.gauge-wrap{background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:18px;display:flex;flex-direction:column;align-items:center;gap:8px;}
.gauge-label{font-size:9.5px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text3);}
.gauge-score{font-family:'Playfair Display',serif;font-size:36px;color:var(--green);line-height:1;}
.gauge-sub{font-size:11px;color:var(--green);font-weight:500;}
.gauge-bar{width:100%;height:6px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;}
.gauge-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--red),var(--amber),var(--green));}
.sentiment-bars{background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:12px;}
.sb-row{display:flex;align-items:center;gap:10px;}
.sb-icon{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.sb-label-s{font-size:12px;font-weight:500;min-width:80px;}
.sb-track{flex:1;height:6px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;}
.sb-fill{height:100%;border-radius:3px;}
.sb-pct{font-family:'JetBrains Mono',monospace;font-size:11px;min-width:32px;text-align:right;}
.sb-count{font-size:10px;color:var(--text3);}
.topics-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.topic-card{background:var(--glass);border:1px solid var(--border);border-radius:10px;padding:14px;}
.topic-head{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.topic-badge{font-size:9px;padding:2px 8px;border-radius:8px;font-weight:600;}
.topic-positive{background:var(--green-dim);color:var(--green);border:1px solid var(--green-border);}
.topic-negative{background:var(--red-dim);color:var(--red);border:1px solid var(--red-border);}
.topic-name{font-size:12.5px;font-weight:500;color:var(--text);}
.topic-score{margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:12px;}
.topic-score.pos{color:var(--green);}
.topic-score.neg{color:var(--red);}
.topic-quotes{display:flex;flex-direction:column;gap:6px;}
.tq{font-size:11.5px;color:var(--text2);line-height:1.5;padding:7px 10px;background:rgba(255,255,255,0.02);border-radius:6px;border-left:2px solid transparent;}
.tq.pos{border-left-color:rgba(62,201,138,0.4);}
.tq.neg{border-left-color:rgba(224,112,112,0.4);}
.kw-row{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px;}
.kw-chip{padding:5px 12px;border-radius:20px;font-size:11.5px;cursor:pointer;transition:all 0.15s;}
.kw-pos{background:var(--green-dim);color:var(--green);border:1px solid var(--green-border);}
.kw-neg{background:var(--red-dim);color:var(--red);border:1px solid var(--red-border);}
.kw-neutral{background:var(--glass2);color:var(--text2);border:1px solid var(--border);}
.review-card{background:var(--glass);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:8px;}
.rev-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;}
.rev-user{display:flex;align-items:center;gap:8px;}
.rev-av{width:28px;height:28px;border-radius:50%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:var(--teal);flex-shrink:0;}
.rev-name{font-size:12.5px;font-weight:500;color:var(--text);}
.rev-date{font-size:10px;color:var(--text3);}
.rev-text{font-size:12.5px;color:var(--text2);line-height:1.65;margin-bottom:8px;}
.rev-sentiment{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.rev-sent-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;padding:3px 9px;border-radius:10px;}
.rs-pos{background:var(--green-dim);color:var(--green);border:1px solid var(--green-border);}
.rs-neg{background:var(--red-dim);color:var(--red);border:1px solid var(--red-border);}
.rs-neutral{background:var(--glass2);color:var(--text2);border:1px solid var(--border);}
.rev-kw{font-size:10px;padding:2px 8px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid var(--border);color:var(--text3);}

/* AI ASSISTANT / CHATBOT */
.chat-header{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-bottom:1px solid var(--border);background:rgba(255,255,255,0.01);flex-shrink:0;}
.ch-left{display:flex;align-items:center;gap:12px;}
.ai-avatar{width:38px;height:38px;border-radius:50%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.25);display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;}
.ai-online{position:absolute;bottom:1px;right:1px;width:9px;height:9px;border-radius:50%;background:var(--green);border:2px solid var(--bg);box-shadow:0 0 5px rgba(62,201,138,0.4);}
.ch-name{font-size:14px;font-weight:500;color:var(--text);}
.ch-status{font-size:11px;color:var(--green);display:flex;align-items:center;gap:5px;}
.ch-status-dot{width:5px;height:5px;border-radius:50%;background:var(--green);animation:chatpulse 2s infinite;}
@keyframes chatpulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
.ch-right{display:flex;gap:7px;}
.ch-btn{padding:6px 14px;border-radius:20px;font-size:11.5px;cursor:pointer;background:var(--glass);border:1px solid var(--border);color:var(--text2);transition:all 0.15s;font-family:'Plus Jakarta Sans',sans-serif;}
.ch-btn:hover{color:var(--text);}
.ai-badge{display:flex;align-items:center;gap:5px;background:rgba(62,207,178,0.06);border:1px solid rgba(62,207,178,0.15);border-radius:20px;padding:4px 12px;font-size:11px;color:var(--teal2);}
.messages-area{flex:1;overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:16px;}
.messages-area::-webkit-scrollbar{width:2px;}
.messages-area::-webkit-scrollbar-thumb{background:var(--border2);}
.msg-user{display:flex;justify-content:flex-end;}
.msg-user-bubble{max-width:65%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);border-radius:16px 16px 4px 16px;padding:11px 15px;font-size:13.5px;color:var(--text);line-height:1.55;}
.msg-ai{display:flex;align-items:flex-start;gap:10px;}
.msg-ai-av{width:30px;height:30px;border-radius:50%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;}
.msg-ai-body{flex:1;max-width:85%;}
.msg-ai-name{font-size:10px;color:var(--text3);margin-bottom:5px;letter-spacing:0.04em;}
.msg-ai-bubble{background:var(--glass);border:1px solid var(--border2);border-radius:4px 16px 16px 16px;padding:13px 16px;font-size:13.5px;color:var(--text2);line-height:1.65;}
.msg-ai-bubble strong{color:var(--text);}
.msg-time{font-size:10px;color:var(--text3);margin-top:4px;text-align:right;}
.agent-steps{background:rgba(62,207,178,0.04);border:1px solid rgba(62,207,178,0.12);border-radius:10px;padding:12px 14px;margin-bottom:8px;}
.as-title{font-size:9.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--teal);margin-bottom:10px;display:flex;align-items:center;gap:6px;}
.as-dot{width:5px;height:5px;border-radius:50%;background:var(--teal);animation:chatpulse 1.5s infinite;}
.step-list{display:flex;flex-direction:column;gap:7px;}
.step-item{display:flex;align-items:center;gap:9px;font-size:11.5px;}
.step-icon{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:9px;}
.si-done{background:var(--green-dim);border:1px solid rgba(62,201,138,0.2);color:var(--green);}
.si-active{background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);}
.si-active-inner{width:8px;height:8px;border-radius:50%;background:var(--teal);animation:chatpulse 1s infinite;}
.step-label{color:var(--text2);}
.step-label.done{color:var(--text);}
.step-label.active{color:var(--teal2);}
.sql-block{background:rgba(0,0,0,0.3);border:1px solid var(--border);border-radius:8px;padding:12px 14px;margin:10px 0;font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--text3);line-height:1.7;overflow-x:auto;white-space:pre-wrap;}
.result-table-wrap{margin:10px 0;border-radius:8px;overflow:hidden;border:1px solid var(--border);}
.result-table{width:100%;border-collapse:collapse;font-size:12px;}
.result-table th{padding:8px 12px;font-size:8.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);text-align:left;font-weight:400;background:rgba(255,255,255,0.02);border-bottom:1px solid var(--border);}
.result-table td{padding:8px 12px;color:var(--text2);border-bottom:1px solid rgba(255,255,255,0.03);}
.result-table tr:last-child td{border:none;}
.result-table tr:hover td{background:rgba(255,255,255,0.02);}
.td-name{color:var(--text);font-weight:500;}
.td-price-c{font-family:'Playfair Display',serif;font-size:13px;color:var(--text);}
.td-score{color:var(--green);font-family:'JetBrains Mono',monospace;}
.prod-chips{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0;}
.prod-chip{display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid var(--border2);cursor:pointer;transition:border-color 0.15s;}
.prod-chip:hover{border-color:rgba(62,207,178,0.2);}
.pc-chip-icon{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.pc-chip-name{font-size:12px;font-weight:500;color:var(--text);}
.pc-chip-price{font-family:'Playfair Display',serif;font-size:12px;color:var(--teal2);}
.typing-ind{display:flex;align-items:center;gap:10px;}
.typing-av{width:30px;height:30px;border-radius:50%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.typing-dots{display:flex;gap:4px;background:var(--glass);border:1px solid var(--border2);border-radius:20px;padding:10px 14px;}
.td-dot{width:6px;height:6px;border-radius:50%;background:var(--text3);animation:tdot 1.2s infinite;}
.td-dot:nth-child(2){animation-delay:0.2s;}
.td-dot:nth-child(3){animation-delay:0.4s;}
@keyframes tdot{0%,60%,100%{transform:translateY(0);opacity:0.4;}30%{transform:translateY(-5px);opacity:1;}}
.suggestions{display:flex;gap:7px;padding:12px 24px;border-top:1px solid var(--border);overflow-x:auto;flex-shrink:0;}
.suggestions::-webkit-scrollbar{display:none;}
.sug{padding:6px 14px;border-radius:20px;font-size:12px;color:var(--text2);background:var(--glass);border:1px solid var(--border);cursor:pointer;white-space:nowrap;transition:all 0.15s;flex-shrink:0;}
.sug:hover{background:var(--glass2);color:var(--text);border-color:var(--border2);}
.chat-input-wrap{padding:14px 24px;border-top:1px solid var(--border);background:rgba(8,8,8,0.6);flex-shrink:0;}
.chat-input-box{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.05);border:1px solid var(--border2);border-radius:14px;padding:10px 14px;transition:border-color 0.2s,box-shadow 0.2s;}
.chat-input-box:focus-within{border-color:rgba(62,207,178,0.3);box-shadow:0 0 0 3px rgba(62,207,178,0.05);}
.chat-input-box input{flex:1;background:transparent;border:none;outline:none;font-size:13.5px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;caret-color:var(--teal);}
.chat-input-box input::placeholder{color:var(--text3);}
.send-btn{width:34px;height:34px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;flex-shrink:0;transition:all 0.15s;}
.send-btn:hover{background:var(--teal2);transform:scale(1.05);}
.input-meta{display:flex;align-items:center;justify-content:space-between;padding:6px 2px 0;}
.im-hint{font-size:10.5px;color:var(--text3);}
.im-counter{font-size:10.5px;color:var(--text3);font-family:'JetBrains Mono',monospace;}
.success-banner{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--green-dim);border:1px solid rgba(62,201,138,0.18);border-radius:8px;margin-bottom:10px;}
.success-banner span{font-size:13px;color:var(--green);font-weight:500;}
@keyframes msg-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.msg-user,.msg-ai,.typing-ind{animation:msg-in 0.3s ease forwards;}

/* SETTINGS */
.settings-frame{display:flex;gap:0;background:var(--glass);border:1px solid var(--border);border-radius:16px;overflow:hidden;min-height:400px;}
.settings-nav{width:200px;border-right:1px solid var(--border);padding:16px 0;}
.settings-main{flex:1;padding:24px;}
.s-group-title{font-size:9px;letter-spacing:0.13em;text-transform:uppercase;color:var(--text3);padding:12px 16px 6px;font-weight:500;}
.s-item{display:flex;align-items:center;gap:8px;padding:8px 16px;font-size:12.5px;color:var(--text2);cursor:pointer;transition:all 0.15s;}
.s-item:hover{background:var(--glass);color:var(--text);}
.s-item.active{background:var(--teal-dim);color:var(--teal2);border-right:2px solid var(--teal);}
.s-item-icon{width:15px;height:15px;opacity:0.6;}
.active .s-item-icon{opacity:1;}
.f-label{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:6px;}
.fi{width:100%;padding:10px 14px;background:var(--glass);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;outline:none;font-family:'Plus Jakarta Sans',sans-serif;transition:border-color 0.2s;}
.fi:focus{border-color:rgba(62,207,178,0.3);}
.save-btn{padding:10px 24px;border-radius:20px;background:var(--teal);color:#080808;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.2s;}
.save-btn:hover{background:var(--teal2);}
.av-section{display:flex;align-items:center;gap:16px;padding:16px;background:var(--glass);border:1px solid var(--border);border-radius:16px;margin-bottom:24px;}
.av-circle{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--teal-dim),transparent);border:2px solid rgba(62,207,178,0.2);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:24px;color:var(--teal);}
.addr-card,.card-saved{display:flex;align-items:flex-start;gap:12px;padding:16px;border-radius:12px;border:1px solid var(--border);background:var(--glass);transition:0.2s;margin-bottom:12px;}
.addr-card:hover,.card-saved:hover{border-color:var(--border2);}
.addr-card.default{border-color:rgba(62,207,178,0.2);background:var(--teal-dim);}
.notif-row{display:flex;align-items:center;gap:15px;padding:14px 16px;border-bottom:1px solid var(--border);background:rgba(255,255,255,0.02);}
.notif-row:last-child{border-bottom:none;}
.tog{width:36px;height:20px;border-radius:10px;position:relative;cursor:pointer;transition:0.3s;background:var(--glass2);border:1px solid var(--border);}
.tog.on{background:var(--teal-dim);border-color:rgba(62,207,178,0.3);}
.tog-thumb{position:absolute;top:3px;left:3px;width:12px;height:12px;border-radius:50%;background:var(--text3);transition:0.3s cubic-bezier(0.18,0.89,0.32,1.28);}
.tog.on .tog-thumb{left:19px;background:var(--teal);}
.danger-box{background:var(--glass);border:1px solid rgba(224,112,112,0.15);border-radius:16px;padding:24px;margin-top:16px;}
.dz-title{font-size:16px;font-weight:500;color:var(--red);margin-bottom:8px;}
.dz-desc{font-size:12.5px;color:var(--text3);line-height:1.6;margin-bottom:16px;}

.breadcrumb{display:flex;align-items:center;gap:6px;padding:12px 24px;border-bottom:1px solid var(--border);}
.bc{font-size:11px;color:var(--text3);cursor:pointer;}
.bc:hover{color:var(--text2);}
.bc-sep{font-size:11px;color:var(--text3);}
.bc-cur{font-size:11px;color:var(--text2);}

@keyframes fadein{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
.pcard:nth-child(1){animation:fadein 0.3s ease 0.04s both;}
.pcard:nth-child(2){animation:fadein 0.3s ease 0.08s both;}
.pcard:nth-child(3){animation:fadein 0.3s ease 0.12s both;}
.pcard:nth-child(4){animation:fadein 0.3s ease 0.16s both;}
.pcard:nth-child(5){animation:fadein 0.3s ease 0.20s both;}
.pcard:nth-child(6){animation:fadein 0.3s ease 0.24s both;}
.wcard:nth-child(1){animation:fadein 0.35s ease 0.04s both;}
.wcard:nth-child(2){animation:fadein 0.35s ease 0.08s both;}
.wcard:nth-child(3){animation:fadein 0.35s ease 0.12s both;}
.wcard:nth-child(4){animation:fadein 0.35s ease 0.16s both;}
.wcard:nth-child(5){animation:fadein 0.35s ease 0.20s both;}
.wcard:nth-child(6){animation:fadein 0.35s ease 0.24s both;}
.ocard:nth-child(1){animation:fadein 0.3s ease 0.04s both;}
.ocard:nth-child(2){animation:fadein 0.3s ease 0.08s both;}
.ocard:nth-child(3){animation:fadein 0.3s ease 0.12s both;}
.ocard:nth-child(4){animation:fadein 0.3s ease 0.16s both;}
.hero-left{animation:fadein 0.5s ease 0.05s both;}
.hero-right{animation:fadein 0.5s ease 0.15s both;}
</style>

<div class="page">
  <!-- NAVBAR -->
  <div class="navbar">
    <div class="logo" (click)="activeTab='home'; selectedProduct=null;"><div class="logo-dot"></div>Nexus</div>
    <div class="nav-pills">
      <div class="npill" [class.active]="activeTab === 'home'" (click)="activeTab='home'; selectedProduct=null;">Home</div>
      <div class="npill" [class.active]="activeTab === 'shop' && !selectedProduct" (click)="activeTab='shop'; selectedProduct=null;">Shop</div>
      <div class="npill" [class.active]="activeTab === 'assistant'" (click)="activeTab='assistant'">AI Assistant</div>
      <div class="npill" [class.active]="activeTab === 'orders'" (click)="activeTab='orders'">Orders</div>
      <div class="npill" [class.active]="activeTab === 'wishlist'" (click)="activeTab='wishlist'">Wishlist</div>
    </div>
    <div class="nav-r">
      <div class="nav-icon" (click)="activeTab='wishlist'">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12S1.5 8 1.5 4.5a3 3 0 0 1 5.5-1.6A3 3 0 0 1 12.5 4.5C12.5 8 7 12 7 12Z" stroke="#6A8A84" stroke-width="1.2"/></svg>
        <div class="nb">{{wishlist.length}}</div>
      </div>
      <div class="nav-icon" routerLink="/cart">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h1.5l1.8 6.5h5.4l1.3-4H4.8" stroke="#6A8A84" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="11" r="1.2" fill="#6A8A84"/><circle cx="10" cy="11" r="1.2" fill="#6A8A84"/></svg>
        <div class="nb" *ngIf="cartCount > 0">{{cartCount}}</div>
      </div>
      <div class="user-pill" (click)="activeTab='settings'">
        <div class="uav">{{auth.currentUserValue?.fullName?.substring(0,2)?.toUpperCase()}}</div>
        <span style="font-size:12px;color:var(--text);font-weight:500;">{{auth.currentUserValue?.fullName}}</span>
        <span style="font-size:9px;color:var(--text3);">▾</span>
      </div>
    </div>
  </div>

  <div class="main-scroll">

    <!-- ==================== HOME TAB ==================== -->
    <ng-container *ngIf="activeTab === 'home'">
      <div class="hero">
        <div class="hero-bg1"></div><div class="hero-bg2"></div><div class="bg-grid"></div>
        <div class="hero-left">
          <div class="hero-greeting"><div class="greet-dot"></div>Welcome back, {{auth.currentUserValue?.fullName?.split(' ')[0]}} 👋</div>
          <div class="hero-title">What will you<br><em>discover</em> today?</div>
          <div class="hero-sub">Browse our curated collection of premium tech. New arrivals are waiting for you.</div>
          <div class="hero-cta">
            <button class="btn-primary" (click)="activeTab='shop'">Continue Shopping →</button>
            <button class="btn-ghost" (click)="activeTab='assistant'">Ask AI Assistant</button>
          </div>
        </div>
        <div class="hero-right">
          <div class="hero-stat">
            <div class="hs-icon" style="background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3h10l-1.2 8H4.2L3 3Z" stroke="#3ECFB2" stroke-width="1.1" stroke-linejoin="round"/><circle cx="6" cy="13" r="1.2" fill="#3ECFB2"/><circle cx="10" cy="13" r="1.2" fill="#3ECFB2"/></svg></div>
            <div><div class="hs-val">3</div><div class="hs-label">Items in cart</div></div>
          </div>
          <div class="hero-stat">
            <div class="hs-icon" style="background:rgba(232,169,74,0.08);border:1px solid rgba(232,169,74,0.18);"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L10 6H15L11 9l1.5 4.5L8 10.5 4.5 13 6 8.5 2 6H7L8 1.5Z" fill="#E8A94A" opacity="0.7"/></svg></div>
            <div><div class="hs-val">2 <em>↓</em></div><div class="hs-label">Price drops</div></div>
          </div>
          <div class="hero-stat">
            <div class="hs-icon" style="background:var(--green-dim);border:1px solid var(--green-border);"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8l3.5 3.5L14 4" stroke="#3EC98A" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <div><div class="hs-val">{{products.length}}</div><div class="hs-label">Products available</div></div>
          </div>
        </div>
      </div>

      <!-- QUICK LINKS -->
      <div class="quick-section">
        <div class="qlink" (click)="activeTab='shop'"><div class="ql-icon" style="background:var(--teal-dim);border:1px solid rgba(62,207,178,0.18);"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 3h12l-1.5 9H4.5L3 3Z" stroke="#3ECFB2" stroke-width="1.2" stroke-linejoin="round"/><circle cx="7" cy="15" r="1.3" fill="#3ECFB2"/><circle cx="11" cy="15" r="1.3" fill="#3ECFB2"/></svg></div><div class="ql-label">Cart</div></div>
        <div class="qlink" (click)="activeTab='wishlist'"><div class="ql-icon" style="background:rgba(224,112,112,0.08);border:1px solid rgba(224,112,112,0.18);"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 15S2 10.5 2 6a4 4 0 0 1 7-2.6A4 4 0 0 1 16 6c0 4.5-7 9-7 9Z" stroke="#E07070" stroke-width="1.2"/></svg></div><div class="ql-label">Wishlist</div></div>
        <div class="qlink" (click)="activeTab='orders'"><div class="ql-icon" style="background:rgba(107,168,200,0.08);border:1px solid rgba(107,168,200,0.18);"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 5.5h14M5 9h8M7.5 12.5h3" stroke="#6BA8C8" stroke-width="1.2" stroke-linecap="round"/></svg></div><div class="ql-label">Orders</div></div>
        <div class="qlink" (click)="activeTab='assistant'"><div class="ql-icon" style="background:rgba(62,201,138,0.08);border:1px solid rgba(62,201,138,0.18);"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 6v6l7 4 7-4V6L9 2Z" stroke="#3EC98A" stroke-width="1.2" stroke-linejoin="round"/><path d="M9 2v7M2 6l7 3.5 7-3.5" stroke="#3EC98A" stroke-width="1.2"/></svg></div><div class="ql-label">AI Assistant</div></div>
        <div class="qlink"><div class="ql-icon" style="background:rgba(232,169,74,0.08);border:1px solid rgba(232,169,74,0.18);"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5L11 7H17L12.5 10.5l1.8 5.5L9 13.5l-5.3 2.5 1.8-5.5L1 7H7L9 1.5Z" stroke="#E8A94A" stroke-width="1.1" stroke-linejoin="round"/></svg></div><div class="ql-label">Deals</div></div>
        <div class="qlink" (click)="activeTab='settings'"><div class="ql-icon" style="background:rgba(167,139,204,0.08);border:1px solid rgba(167,139,204,0.18);"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="4" stroke="#A78BCC" stroke-width="1.2"/><path d="M2 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="#A78BCC" stroke-width="1.2" stroke-linecap="round"/></svg></div><div class="ql-label">Profile</div></div>
      </div>

      <!-- FLASH SALE -->
      <div class="flash-section">
        <div class="flash-banner">
          <div class="fb-left">
            <div class="fb-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 1.5L13 8H20L14.5 12l2 6.5L10 15l-6.5 3.5 2-6.5L0 8H7L10 1.5Z" fill="#3ECFB2" opacity="0.7"/></svg></div>
            <div>
              <div class="fb-title">Flash Sale — Today Only!</div>
              <div class="fb-sub">20–30% off on selected products · Limited stock</div>
            </div>
          </div>
          <div class="fb-timer">
            <div class="fb-unit">04</div><div class="fb-sep">:</div>
            <div class="fb-unit">23</div><div class="fb-sep">:</div>
            <div class="fb-unit">17</div>
          </div>
          <button class="fb-btn" (click)="activeTab='shop'">View Deals →</button>
        </div>
      </div>

      <!-- CONTINUE SHOPPING -->
      <div class="continue-section" *ngIf="products.length > 0">
        <div class="sec-header">
          <div><div class="sec-title">Continue Where You Left Off</div><div class="sec-sub">Recently viewed products</div></div>
          <div class="sec-link" (click)="activeTab='shop'">See all →</div>
        </div>
        <div class="continue-grid">
          <div class="cs-card" *ngFor="let p of products.slice(0,4)" (click)="selectProduct(p)">
            <div class="cs-img" style="background:rgba(62,207,178,0.04);">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="5" width="18" height="12" rx="2.5" stroke="#3ECFB2" stroke-width="1.1" opacity="0.5"/></svg>
            </div>
            <div style="flex:1;min-width:0;">
              <div class="cs-name">{{p.name}}</div>
              <div style="font-size:9.5px;color:var(--text3);margin-top:2px;">{{p.basePrice | currency}} · {{p.category}}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TRENDING -->
      <div class="trending-section" *ngIf="products.length > 0">
        <div class="sec-header">
          <div><div class="sec-title">Trending This Week</div><div class="sec-sub">Best-selling products right now</div></div>
          <div class="sec-link" (click)="activeTab='shop'">See all →</div>
        </div>
        <div class="prod-grid" style="grid-template-columns:repeat(4,1fr);">
          <div class="pcard" *ngFor="let p of products.slice(0,4)" (click)="selectProduct(p)">
            <div class="pc-img" style="background:rgba(62,207,178,0.04);">
              <div class="pc-img-glow" style="background:radial-gradient(circle,rgba(62,207,178,0.09),transparent 70%)"></div>
              <img *ngIf="p.imageUrl" [src]="p.imageUrl" style="max-width:70%;max-height:70%;object-fit:contain;position:relative;z-index:1;"/>
              <svg *ngIf="!p.imageUrl" width="70" height="70" viewBox="0 0 70 70" fill="none"><rect x="7" y="16" width="56" height="36" rx="5" stroke="#3ECFB2" stroke-width="1.2" opacity="0.42"/><rect x="28" y="52" width="14" height="3.5" rx="1.75" fill="rgba(62,207,178,0.2)"/></svg>
              <div class="pc-badges"><div *ngIf="p.stockQuantity > 50" class="pc-badge b-new">New</div></div>
              <div class="pc-wish" (click)="$event.stopPropagation(); toggleWishlist(p)">♡</div>
              <div class="pc-quick"><button class="pc-quick-btn" (click)="$event.stopPropagation(); addToCart(p)">Add to Cart</button></div>
            </div>
            <div class="pc-body">
              <div class="pc-brand">{{p.brand}}</div>
              <div class="pc-name">{{p.name}}</div>
              <div style="display:flex;align-items:center;gap:5px;margin-bottom:6px;"><span class="pc-star">★★★★★</span><span class="pc-rcount">4.8</span></div>
              <div class="pc-bottom"><div><span class="pc-price">{{p.basePrice | currency}}</span></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- CATEGORIES -->
      <div class="categories-section">
        <div class="sec-header">
          <div><div class="sec-title">Shop by Category</div></div>
          <div class="sec-link" (click)="activeTab='shop'">See all →</div>
        </div>
        <div class="cat-grid">
          <div class="cat-card" *ngFor="let c of categories" (click)="activeTab='shop'; selectedCat=c.name;">
            <div class="cat-icon" style="background:var(--teal-dim);border:1px solid rgba(62,207,178,0.18);"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="10" rx="2.5" stroke="#3ECFB2" stroke-width="1.1" opacity="0.7"/></svg></div>
            <div class="cat-name">{{c.name}}</div>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- ==================== SHOP TAB ==================== -->
    <ng-container *ngIf="activeTab === 'shop' && !selectedProduct">
      <div class="search-hero">
        <div class="sh-glow"></div>
        <div class="sh-top">
          <div><div class="sh-title">Browse Products</div><div class="sh-sub">{{products.length}} curated tech items</div></div>
          <div style="display:flex;gap:8px;align-items:center;">
            <div class="filter-toggle" [class.active]="filtersOpen" (click)="filtersOpen = !filtersOpen">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 3.5h10M3.5 6.5h6M5.5 9.5h2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
              Filters
              <div class="ft-badge" [class.show]="activeFilters.length > 0">{{activeFilters.length}}</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text2);background:var(--glass);border:1px solid var(--border);border-radius:20px;padding:6px 14px;cursor:pointer;">
              Sort: Featured <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="#6A8A84" stroke-width="1.1" stroke-linecap="round"/></svg>
            </div>
          </div>
        </div>
        <div class="search-bar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#3ECFB2" stroke-width="1.2"/><path d="M10 10l2.5 2.5" stroke="#3ECFB2" stroke-width="1.2" stroke-linecap="round"/></svg>
          <input [(ngModel)]="searchQuery" placeholder="Search products, brands, categories…"/>
          <div class="search-count">{{filteredProducts.length}} results</div>
        </div>
        <div class="cat-row">
          <div class="cat-pill" [class.active]="selectedCat==='All'" (click)="selectedCat='All'">All</div>
          <div class="cat-pill" *ngFor="let c of categories" [class.active]="selectedCat===c.name" (click)="selectedCat=c.name">{{c.name}}</div>
        </div>
      </div>

      <div class="shop-body">
        <div class="filter-sidebar" [class.collapsed]="!filtersOpen">
          <div class="fs-head">
            <div class="fs-title">Filters</div>
            <div class="fs-clear" (click)="resetFilters()">Clear all</div>
          </div>
          <div class="fsec">
            <div class="fsec-label">Brand <span>▾</span></div>
            <div class="fsec-body">
              <div class="fcheck" *ngFor="let b of brands" [class.on]="b.checked" (click)="b.checked = !b.checked">
                <div class="fbox"><svg *ngIf="b.checked" width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#3ECFB2" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <span class="flabel">{{b.name}}</span><span class="fcount">12</span>
              </div>
            </div>
          </div>
          <div class="fsec">
            <div class="fsec-label">Price Range <span>▾</span></div>
            <div class="fsec-body">
              <div class="fcheck" [class.on]="maxPrice <= 500" (click)="maxPrice = 500"><div class="fbox"><svg *ngIf="maxPrice <= 500" width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#3ECFB2" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="flabel">Under $500</span></div>
              <div class="fcheck" [class.on]="maxPrice > 500 && maxPrice <= 1000" (click)="maxPrice = 1000"><div class="fbox"></div><span class="flabel">$500 – $1,000</span></div>
              <div class="fcheck" (click)="maxPrice = 3000"><div class="fbox"></div><span class="flabel">$1,000+</span></div>
              <div class="price-inputs"><input class="pinput" [(ngModel)]="minPrice" placeholder="Min"/><div class="psep">—</div><input class="pinput" [(ngModel)]="maxPrice" placeholder="Max"/></div>
            </div>
          </div>
          <div class="fsec">
            <div class="fsec-label">Rating <span>▾</span></div>
            <div class="rating-opts">
              <div class="ropt" (click)="selectedRating = 5" [class.sel]="selectedRating === 5"><span class="rstar">★★★★★</span><span class="rlabel">5 stars</span></div>
              <div class="ropt" (click)="selectedRating = 4" [class.sel]="selectedRating === 4"><span class="rstar">★★★★</span><span class="rstare">★</span><span class="rlabel">4+ stars</span></div>
              <div class="ropt" (click)="selectedRating = 3" [class.sel]="selectedRating === 3"><span class="rstar">★★★</span><span class="rstare">★★</span><span class="rlabel">3+ stars</span></div>
            </div>
          </div>
          <div class="fsec">
            <div class="fsec-label">Availability <span>▾</span></div>
            <div class="fsec-body">
              <div class="fcheck" [class.on]="availability.inStock" (click)="availability.inStock = !availability.inStock"><div class="fbox"><svg *ngIf="availability.inStock" width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#3ECFB2" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="flabel">In Stock</span></div>
            </div>
          </div>
        </div>

        <div class="products-area">
          <div class="active-chips" *ngIf="activeFilters.length > 0">
            <div class="achip" *ngFor="let f of activeFilters">{{f}} <span class="achip-x" (click)="removeChip(f)">×</span></div>
          </div>
          <div class="results-bar">
            <div class="rb-count"><span>{{filteredProducts.length}}</span> products found</div>
            <div class="rb-sort">Relevance <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="#6A8A84" stroke-width="1.1" stroke-linecap="round"/></svg></div>
          </div>
          <div class="prod-grid">
            <div class="pcard" *ngFor="let p of filteredProducts" (click)="selectProduct(p)">
              <div class="pc-img" style="background:rgba(62,207,178,0.04);">
                <div class="pc-img-glow" style="background:radial-gradient(circle,rgba(62,207,178,0.09),transparent 70%)"></div>
                <img *ngIf="p.imageUrl" [src]="p.imageUrl" style="max-width:80%;max-height:80%;object-fit:contain;position:relative;z-index:1;"/>
                <svg *ngIf="!p.imageUrl" width="80" height="80" viewBox="0 0 80 80" fill="none"><rect x="8" y="18" width="64" height="40" rx="5" stroke="#3ECFB2" stroke-width="1.3" opacity="0.4"/><rect x="32" y="58" width="16" height="4" rx="2" fill="rgba(62,207,178,0.2)"/></svg>
                <div class="pc-badges"><div *ngIf="p.stockQuantity > 50" class="pc-badge b-new">New</div></div>
                <div class="pc-wish" (click)="$event.stopPropagation(); toggleWishlist(p)">♡</div>
                <div class="pc-quick"><button class="pc-quick-btn" (click)="$event.stopPropagation(); addToCart(p)">Add to Cart</button></div>
              </div>
              <div class="pc-body">
                <div class="pc-brand">{{p.brand}}</div>
                <div class="pc-name">{{p.name}}</div>
                <div class="pc-stars"><span class="pc-star">★★★★★</span><span class="pc-rcount">4.8</span></div>
                <div class="pc-bottom">
                  <div><span class="pc-price">{{p.basePrice | currency}}</span></div>
                  <div class="pc-stock" [class.pc-instock]="p.stockQuantity > 5" [class.pc-lowstock]="p.stockQuantity <= 5 && p.stockQuantity > 0">{{p.stockQuantity > 5 ? 'In Stock' : p.stockQuantity + ' left'}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- ==================== PRODUCT DETAIL ==================== -->
    <ng-container *ngIf="selectedProduct">
      <div class="breadcrumb">
        <span class="bc" (click)="activeTab='home'; selectedProduct=null;">Home</span><span class="bc-sep">/</span>
        <span class="bc" (click)="activeTab='shop'; selectedProduct=null;">{{selectedProduct.category}}</span><span class="bc-sep">/</span>
        <span class="bc-cur">{{selectedProduct.name}}</span>
      </div>
      <div class="product-section">
        <div class="img-col">
          <div class="main-img">
            <div class="img-glow"></div>
            <div *ngIf="selectedProduct.stockQuantity > 50" class="img-badge b-new">New</div>
            <img *ngIf="selectedProduct.imageUrl" [src]="selectedProduct.imageUrl" style="max-width:80%;max-height:80%;object-fit:contain;position:relative;z-index:1;"/>
            <svg *ngIf="!selectedProduct.imageUrl" width="160" height="160" viewBox="0 0 160 160" fill="none"><rect x="16" y="38" width="128" height="80" rx="8" stroke="#3ECFB2" stroke-width="1.5" opacity="0.45"/><rect x="60" y="118" width="40" height="8" rx="4" fill="rgba(62,207,178,0.15)"/></svg>
          </div>
          <div class="thumb-row">
            <div class="thumb active"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="12" rx="2.5" stroke="#3ECFB2" stroke-width="1" opacity="0.5"/></svg></div>
            <div class="thumb"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" stroke="#6A8A84" stroke-width="1" opacity="0.4"/></svg></div>
            <div class="thumb"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7" stroke="#6A8A84" stroke-width="1" opacity="0.4"/></svg></div>
          </div>
        </div>
        <div class="info-col">
          <div class="prod-brand">{{selectedProduct.brand}}</div>
          <div class="prod-name">{{selectedProduct.name}}</div>
          <div class="rating-row">
            <div class="stars"><svg class="star" viewBox="0 0 13 13" fill="#E8A94A"><path d="M6.5 1l1.6 3.2L12 4.8l-2.75 2.68.65 3.77L6.5 9.65l-3.4 1.6.65-3.77L1 4.8l3.9-.6L6.5 1Z"/></svg><svg class="star" viewBox="0 0 13 13" fill="#E8A94A"><path d="M6.5 1l1.6 3.2L12 4.8l-2.75 2.68.65 3.77L6.5 9.65l-3.4 1.6.65-3.77L1 4.8l3.9-.6L6.5 1Z"/></svg><svg class="star" viewBox="0 0 13 13" fill="#E8A94A"><path d="M6.5 1l1.6 3.2L12 4.8l-2.75 2.68.65 3.77L6.5 9.65l-3.4 1.6.65-3.77L1 4.8l3.9-.6L6.5 1Z"/></svg><svg class="star" viewBox="0 0 13 13" fill="#E8A94A"><path d="M6.5 1l1.6 3.2L12 4.8l-2.75 2.68.65 3.77L6.5 9.65l-3.4 1.6.65-3.77L1 4.8l3.9-.6L6.5 1Z"/></svg><svg class="star" viewBox="0 0 13 13" fill="#E8A94A"><path d="M6.5 1l1.6 3.2L12 4.8l-2.75 2.68.65 3.77L6.5 9.65l-3.4 1.6.65-3.77L1 4.8l3.9-.6L6.5 1Z"/></svg></div>
            <span class="rating-val">4.9</span>
            <span class="rating-count">(284 reviews)</span>
          </div>
          <div class="price-row">
            <div class="price">{{selectedProduct.basePrice | currency}}</div>
          </div>
          <div class="stock-row-detail">
            <div class="stock-dot-detail"></div>
            <div class="stock-txt">In stock · Ships in 24h</div>
          </div>
          <div class="divider"></div>
          <div class="action-row">
            <div class="qty-box">
              <div class="qty-btn" (click)="qty > 1 ? qty = qty - 1 : null">−</div>
              <div class="qty-val">{{qty}}</div>
              <div class="qty-btn" (click)="qty = qty + 1">+</div>
            </div>
            <button class="add-btn" (click)="addToCart(selectedProduct)">Add to Cart →</button>
            <div class="wish-btn" (click)="toggleWishlist(selectedProduct)"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12S1.5 8 1.5 4.5a3 3 0 0 1 5.5-1.6A3 3 0 0 1 12.5 4.5C12.5 8 7 12 7 12Z" stroke="#6A8A84" stroke-width="1.2"/></svg></div>
          </div>
          <div class="specs-grid">
            <div class="spec"><div class="spec-key">Category</div><div class="spec-val">{{selectedProduct.category}}</div></div>
            <div class="spec"><div class="spec-key">Brand</div><div class="spec-val">{{selectedProduct.brand}}</div></div>
            <div class="spec"><div class="spec-key">Stock</div><div class="spec-val">{{selectedProduct.stockQuantity}} units</div></div>
            <div class="spec"><div class="spec-key">Rating</div><div class="spec-val">4.9 / 5.0</div></div>
          </div>
        </div>
      </div>

      <!-- SENTIMENT ANALYSIS -->
      <div class="sentiment-section" *ngIf="sentiments[selectedProduct.productId]">
        <div class="sec-title" style="font-size:20px;margin-bottom:4px;">AI Sentiment Analysis</div>
        <div style="font-size:12px;color:var(--text3);margin-bottom:20px;">Based on verified reviews · Powered by Nexus AI</div>
        <div class="ai-powered"><div class="ai-dot"></div>Analyzed by Nexus AI</div>
        <div class="sentiment-overview">
          <div class="gauge-wrap">
            <div class="gauge-label">Overall Sentiment</div>
            <div class="gauge-score">{{sentiments[selectedProduct.productId].averageScore * 100 | number:'1.0-0'}}%</div>
            <div class="gauge-sub">{{sentiments[selectedProduct.productId].averageScore > 0.7 ? 'Very Positive' : 'Mixed'}}</div>
            <div class="gauge-bar"><div class="gauge-fill" [style.width.%]="sentiments[selectedProduct.productId].averageScore * 100"></div></div>
            <div style="font-size:10px;color:var(--text3);margin-top:4px;">{{sentiments[selectedProduct.productId].totalReviews || 0}} reviews analyzed</div>
          </div>
          <div class="sentiment-bars">
            <div class="sb-row">
              <div class="sb-icon" style="background:var(--green-dim);border:1px solid var(--green-border);"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="#3EC98A" stroke-width="1.1"/></svg></div>
              <div class="sb-label-s" style="color:var(--green);">Positive</div>
              <div class="sb-track"><div class="sb-fill" [style.width.%]="(sentiments[selectedProduct.productId].positivePercent || 78)" style="background:var(--green);"></div></div>
              <div class="sb-pct" style="color:var(--green);">{{sentiments[selectedProduct.productId].positivePercent || 78}}%</div>
            </div>
            <div class="sb-row">
              <div class="sb-icon" style="background:var(--glass2);border:1px solid var(--border2);"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="#6A8A84" stroke-width="1.1"/></svg></div>
              <div class="sb-label-s" style="color:var(--text2);">Neutral</div>
              <div class="sb-track"><div class="sb-fill" [style.width.%]="(sentiments[selectedProduct.productId].neutralPercent || 14)" style="background:var(--text2);"></div></div>
              <div class="sb-pct" style="color:var(--text2);">{{sentiments[selectedProduct.productId].neutralPercent || 14}}%</div>
            </div>
            <div class="sb-row">
              <div class="sb-icon" style="background:var(--red-dim);border:1px solid var(--red-border);"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="#E07070" stroke-width="1.1"/></svg></div>
              <div class="sb-label-s" style="color:var(--red);">Negative</div>
              <div class="sb-track"><div class="sb-fill" [style.width.%]="(sentiments[selectedProduct.productId].negativePercent || 8)" style="background:var(--red);"></div></div>
              <div class="sb-pct" style="color:var(--red);">{{sentiments[selectedProduct.productId].negativePercent || 8}}%</div>
            </div>
          </div>
        </div>

        <div style="margin-bottom:20px;">
          <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text3);margin-bottom:12px;">Most Mentioned Keywords</div>
          <div class="kw-row">
            <div class="kw-chip kw-pos" *ngFor="let kw of sentiments[selectedProduct.productId].topKeywords?.slice(0,6) || ['great quality','fast shipping','premium build','worth it']">{{kw}}</div>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- ==================== WISHLIST TAB ==================== -->
    <ng-container *ngIf="activeTab === 'wishlist'">
      <div style="height:12px;"></div>
      <div class="alert-banner" *ngIf="wishlist.length > 0">
        <div class="ab-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L10 6H15L11 9l1.5 5L8 11.5 4.5 14 6 9 2 6H7L8 1.5Z" fill="#3EC98A" opacity="0.8"/></svg></div>
        <div class="ab-text"><strong>Price drop!</strong> {{wishlist.length}} items on your wishlist. Check for deals today.</div>
        <div class="ab-btn" (click)="activeTab='shop'">View deals →</div>
      </div>
      <div class="page-header">
        <div class="ph-top">
          <div>
            <div class="ph-title">My Wishlist</div>
            <div class="ph-sub">{{wishlist.length}} saved items</div>
          </div>
          <div class="ph-actions">
            <div class="ph-btn ph-ghost">Share list</div>
            <div class="ph-btn ph-teal">Add all to cart</div>
          </div>
        </div>
      </div>
      <div class="filter-row">
        <div class="fchip active">All ({{wishlist.length}})</div>
        <div class="fchip">In Stock</div>
      </div>
      <div class="wish-grid">
        <div class="wcard" *ngFor="let p of wishlist">
          <div class="wc-img" style="background:rgba(62,207,178,0.04);">
            <div class="wc-glow" style="background:radial-gradient(circle,rgba(62,207,178,0.08),transparent 70%)"></div>
            <img *ngIf="p.imageUrl" [src]="p.imageUrl" style="max-width:70%;max-height:70%;object-fit:contain;position:relative;z-index:1;"/>
            <svg *ngIf="!p.imageUrl" width="72" height="72" viewBox="0 0 72 72" fill="none"><rect x="8" y="18" width="56" height="36" rx="5" stroke="#3ECFB2" stroke-width="1.3" opacity="0.45"/></svg>
            <div class="wc-top-badges">
              <div *ngIf="p.stockQuantity > 50" class="wc-badge b-new">New</div>
              <div *ngIf="p.stockQuantity <= 50 && p.stockQuantity > 0"></div>
              <div class="wc-remove" (click)="toggleWishlist(p)">×</div>
            </div>
          </div>
          <div class="wc-body">
            <div class="wc-cat">{{p.category}} · {{p.brand}}</div>
            <div class="wc-name">{{p.name}}</div>
            <div class="wc-price-row"><div class="wc-price">{{p.basePrice | currency}}</div></div>
            <div class="wc-meta"><div class="wc-stars">★★★★★</div><div class="wc-rating">4.8</div><div class="wc-saved">Saved recently</div></div>
            <div class="wc-actions"><button class="wc-cart" (click)="addToCart(p)">Add to Cart</button><div class="wc-more" (click)="selectProduct(p)">⋯</div></div>
          </div>
        </div>
      </div>
      <div *ngIf="wishlist.length === 0" style="text-align:center;padding:60px 24px;color:var(--text3);">
        <div style="font-size:40px;margin-bottom:16px;opacity:0.3;">♡</div>
        <div style="font-size:14px;margin-bottom:8px;color:var(--text2);">Your wishlist is empty</div>
        <div style="font-size:12px;margin-bottom:20px;">Browse products and save your favorites here.</div>
        <button class="btn-primary" style="display:inline-flex;" (click)="activeTab='shop'">Browse Products →</button>
      </div>
    </ng-container>

    <!-- ==================== ORDERS TAB ==================== -->
    <ng-container *ngIf="activeTab === 'orders'">
      <div class="orders-content">
        <div class="page-head-orders">
          <div>
            <div class="ph-title">Purchase History</div>
            <div class="ph-sub">{{consumerOrders.length}} orders · Your spending analytics</div>
          </div>
          <div style="display:flex;gap:8px;">
            <div class="ph-btn ph-ghost">Export PDF</div>
            <div class="ph-btn ph-teal">Track Active Orders</div>
          </div>
        </div>

        <div class="summary-bar">
          <div class="sb-item"><div class="sb-val">{{consumerOrders.length}}</div><div class="sb-label">Total Orders</div></div>
          <div class="sb-item"><div class="sb-val">{{consumerTotalSpent | currency:'USD':'symbol':'1.0-0'}}</div><div class="sb-label">Total Spent</div></div>
          <div class="sb-item"><div class="sb-val">{{consumerActiveOrders}}</div><div class="sb-label">Active Orders</div></div>
          <div class="sb-item"><div class="sb-val">{{consumerAvgRating}}<em>★</em></div><div class="sb-label">Avg. Rating</div></div>
        </div>

        <div class="toolbar">
          <div class="search-box">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="#344844" stroke-width="1.2"/><path d="M9 9l2.5 2.5" stroke="#344844" stroke-width="1.2" stroke-linecap="round"/></svg>
            <input placeholder="Search orders by product or ID…"/>
          </div>
          <div class="filter-chips">
            <div class="fchip active">All ({{consumerOrders.length}})</div>
            <div class="fchip">Active ({{consumerActiveOrders}})</div>
            <div class="fchip">Delivered ({{consumerDelivered}})</div>
            <div class="fchip">Cancelled ({{consumerCancelled}})</div>
          </div>
        </div>

        <div class="orders">
          <div class="ocard" *ngFor="let o of consumerOrders" [style.border-color]="o.status === 'CANCELLED' ? 'rgba(224,112,112,0.08)' : ''">
            <div class="oc-header">
              <div class="och-left">
                <div class="oc-id">#ORD-{{o.orderId}}</div>
                <div class="oc-date">{{o.orderDate | date:'mediumDate'}}</div>
                <div class="oc-items-count">{{o.items?.length || 0}} item{{(o.items?.length || 0) > 1 ? 's' : ''}}</div>
              </div>
              <div class="och-right">
                <div class="oc-total">{{o.totalAmount | currency}}</div>
                <div class="spill" [class.sp-b]="o.status === 'SHIPPED' || o.status === 'PROCESSING'" [class.sp-g]="o.status === 'DELIVERED'" [class.sp-r]="o.status === 'CANCELLED'" [class.sp-a]="o.status === 'PENDING'">● {{o.status}}</div>
              </div>
            </div>
            <ng-container *ngIf="o.items && o.items.length > 0">
              <div class="oc-items-row" *ngFor="let item of o.items.slice(0,3)">
                <div class="oi-img" style="background:rgba(62,207,178,0.04);">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="10" rx="2" stroke="#3ECFB2" stroke-width="1.1" opacity="0.5"/></svg>
                </div>
                <div class="oi-info">
                  <div class="oi-name">{{item.product?.name || 'Product'}}</div>
                  <div class="oi-var">{{item.product?.category || ''}}</div>
                </div>
                <div class="oi-qty">×{{item.quantity}}</div>
                <div class="oi-price">{{item.priceAtPurchase | currency}}</div>
              </div>
            </ng-container>
            <div class="oc-actions">
              <div class="oa-btn oa-teal" *ngIf="o.status !== 'CANCELLED' && o.status !== 'DELIVERED'" routerLink="/orders">Track Order</div>
              <div class="oa-btn oa-ghost" *ngIf="o.status === 'DELIVERED'" routerLink="/orders">Write Review</div>
              <div class="oa-btn oa-ghost" *ngIf="o.status === 'CANCELLED'" (click)="reorder(o)">Reorder</div>
            </div>
          </div>

          <div *ngIf="consumerOrders.length === 0" style="text-align:center;padding:48px;color:var(--text3);">
            <div style="font-size:36px;margin-bottom:12px;opacity:0.15;">📦</div>
            <div style="font-size:13px;">No orders yet. Start shopping!</div>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- ==================== AI ASSISTANT ==================== -->
    <ng-container *ngIf="activeTab === 'assistant'">
      <div style="display:flex;flex-direction:column;height:100%;">

        <!-- CHAT HEADER -->
        <div class="chat-header">
          <div class="ch-left">
            <div class="ai-avatar">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 5.5v7L9 16l7-3.5v-7L9 2Z" stroke="#3ECFB2" stroke-width="1.2" stroke-linejoin="round"/><path d="M9 2v7M2 5.5l7 3.5 7-3.5" stroke="#3ECFB2" stroke-width="1.2"/><circle cx="9" cy="9" r="2" fill="#3ECFB2" opacity="0.6"/></svg>
              <div class="ai-online"></div>
            </div>
            <div>
              <div class="ch-name">Nexus AI</div>
              <div class="ch-status"><div class="ch-status-dot"></div>Online · Text2SQL powered</div>
            </div>
          </div>
          <div class="ch-right">
            <div class="ai-badge">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1L2 2.5v3c0 2 1.3 3.5 3 4.2C7.7 9 9 7.5 9 5.5v-3L5 1Z" stroke="#3ECFB2" stroke-width="0.9"/></svg>
              LangGraph · Chainlit
            </div>
            <div class="ch-btn" (click)="clearChat()">New Chat</div>
          </div>
        </div>

        <!-- MESSAGES -->
        <div class="messages-area" #messagesContainer>
          <ng-container *ngFor="let m of chatMessages; let i = index">
            <!-- USER MESSAGE -->
            <div *ngIf="m.sender==='user'" class="msg-user">
              <div class="msg-user-bubble">{{m.text}}</div>
            </div>
            <!-- AI MESSAGE -->
            <div *ngIf="m.sender==='ai'" class="msg-ai">
              <div class="msg-ai-av"><svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 5.5v7L9 16l7-3.5v-7L9 2Z" stroke="#3ECFB2" stroke-width="1.3" stroke-linejoin="round"/></svg></div>
              <div class="msg-ai-body">
                <div class="msg-ai-name">NEXUS AI</div>
                <div class="msg-ai-bubble">
                  <!-- AGENT STEPS (only for responses with steps) -->
                  <div class="agent-steps" *ngIf="m.steps && m.steps.length > 0">
                    <div class="as-title"><div class="as-dot"></div>Agent ran · {{m.duration || '0.8s'}}</div>
                    <div class="step-list">
                      <div class="step-item" *ngFor="let s of m.steps">
                        <div class="step-icon si-done">✓</div>
                        <span class="step-label done">{{s}}</span>
                      </div>
                    </div>
                  </div>
                  <!-- SQL BLOCK -->
                  <div *ngIf="m.sql">
                    <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:6px;">Generated SQL</div>
                    <div class="sql-block">{{m.sql}}</div>
                  </div>
                  <!-- RESULT TABLE -->
                  <div *ngIf="m.results && m.results.length > 0">
                    <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:6px;">Results</div>
                    <div class="result-table-wrap">
                      <table class="result-table">
                        <thead><tr><th>Product</th><th>Price</th><th>Rating</th><th>Stock</th></tr></thead>
                        <tbody>
                          <tr *ngFor="let r of m.results"><td class="td-name">{{r.name}}</td><td class="td-price-c">{{r.basePrice | currency}}</td><td class="td-score">{{r.rating || '4.8'}}★</td><td style="font-size:11px;color:var(--green);">{{r.stockQuantity > 0 ? '✓ In stock' : 'Out of stock'}}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <!-- SUCCESS BANNER -->
                  <div class="success-banner" *ngIf="m.success">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#3EC98A" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="#3EC98A" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <span>{{m.success}}</span>
                  </div>
                  <!-- TEXT -->
                  <div [innerHTML]="m.text"></div>
                  <!-- PLOTLY VISUALIZATION -->
                  <div *ngIf="m.visualization" class="plotly-wrap">
                    <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--teal);margin-bottom:8px;">AI-Generated Chart</div>
                    <div [id]="'plotly-chart-' + i" style="width:100%;min-height:300px;background:rgba(255,255,255,0.02);border-radius:10px;overflow:hidden;"></div>
                  </div>
                  <!-- PRODUCT CHIPS -->
                  <div class="prod-chips" *ngIf="m.results && m.results.length > 0">
                    <div class="prod-chip" *ngFor="let r of m.results.slice(0,3)" (click)="selectProduct(r)">
                      <div class="pc-chip-icon" style="background:rgba(62,207,178,0.08);"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L1 4v4l6 3 6-3V4L7 1Z" stroke="#3ECFB2" stroke-width="1.1" stroke-linejoin="round"/></svg></div>
                      <div><div class="pc-chip-name">{{r.name}}</div><div class="pc-chip-price">{{r.basePrice | currency}}</div></div>
                    </div>
                  </div>
                </div>
                <div class="msg-time">{{m.time}}</div>
              </div>
            </div>
          </ng-container>
          <!-- TYPING / STREAMING INDICATOR -->
          <div class="typing-ind" *ngIf="isTyping">
            <div class="typing-av"><svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 5.5v7L9 16l7-3.5v-7L9 2Z" stroke="#3ECFB2" stroke-width="1.3" stroke-linejoin="round"/></svg></div>
            <div *ngIf="streamSteps.length === 0" class="typing-dots"><div class="td-dot"></div><div class="td-dot"></div><div class="td-dot"></div></div>
            <div *ngIf="streamSteps.length > 0" style="display:flex;flex-direction:column;gap:3px;">
              <div *ngFor="let step of streamSteps" style="font-size:10px;color:var(--teal);display:flex;align-items:center;gap:5px;">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="3" stroke="#3ECFB2" stroke-width="1"/></svg>
                {{step}}
              </div>
              <div class="typing-dots" style="margin-top:2px;"><div class="td-dot"></div><div class="td-dot"></div><div class="td-dot"></div></div>
            </div>
          </div>
        </div>

        <!-- SUGGESTIONS -->
        <div class="suggestions">
          <div class="sug" *ngFor="let s of chatSuggestions" (click)="sendSuggestion(s)">{{s}}</div>
        </div>

        <!-- INPUT -->
        <div class="chat-input-wrap">
          <div class="chat-input-box">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="#344844" stroke-width="1.2"/><path d="M7.5 5v3M7.5 10v.3" stroke="#344844" stroke-width="1.2" stroke-linecap="round"/></svg>
            <input placeholder="Ask anything… product search, price comparison, stock check" [(ngModel)]="prompt" (keyup.enter)="sendQuery()" maxlength="500"/>
            <button class="send-btn" (click)="sendQuery()" [disabled]="!prompt.trim()">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5L2 2l2 4.5-2 4.5 9-4.5Z" fill="#080808"/></svg>
            </button>
          </div>
          <div class="input-meta">
            <div class="im-hint">Text2SQL · LangGraph · Chainlit · GPT-4o</div>
            <div class="im-counter">{{prompt.length}} / 500</div>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- ==================== SETTINGS ==================== -->
    <ng-container *ngIf="activeTab === 'settings'">
      <div style="padding:24px;">
        <div class="ph-title" style="margin-bottom:20px;">Settings</div>
        <div class="settings-frame">
          <div class="settings-nav">
            <div class="s-group-title">Account</div>
            <div class="s-item" [class.active]="settingsTab==='personal'" (click)="settingsTab='personal'">
              <svg class="s-item-icon" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="3" stroke="currentColor" stroke-width="1.1"/><path d="M2 13c0-3 2.5-4.5 5.5-4.5S13 10 13 13" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>
              Personal Info
            </div>
            <div class="s-item" [class.active]="settingsTab==='security'" (click)="settingsTab='security'">
              <svg class="s-item-icon" viewBox="0 0 15 15" fill="none"><rect x="2.5" y="6" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.1"/><path d="M5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>
              Security
            </div>
            <div class="s-group-title">Shopping</div>
            <div class="s-item" [class.active]="settingsTab==='addresses'" (click)="settingsTab='addresses'">
              <svg class="s-item-icon" viewBox="0 0 15 15" fill="none"><path d="M7.5 2C5.3 2 3.5 3.8 3.5 6c0 3.5 4 7 4 7s4-3.5 4-7c0-2.2-1.8-4-4-4Z" stroke="currentColor" stroke-width="1.1"/></svg>
              Addresses
            </div>
            <div class="s-item" [class.active]="settingsTab==='notifications'" (click)="settingsTab='notifications'">
              <svg class="s-item-icon" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5C5.3 1.5 3.5 3.3 3.5 5.5V8l-1 1.5h10L11.5 8V5.5c0-2.2-1.8-4-4-4Z" stroke="currentColor" stroke-width="1.1"/><path d="M6 11.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5" stroke="currentColor" stroke-width="1.1"/></svg>
              Notifications
            </div>
            <div class="s-item" style="margin-top:20px;color:var(--red);" (click)="settingsTab='danger'">
              <svg class="s-item-icon" viewBox="0 0 15 15" fill="none"><path d="M3 13h9l-4.5-9L3 13Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>
              Danger Zone
            </div>
          </div>
          <div class="settings-main">
            <ng-container *ngIf="settingsTab === 'personal'">
              <div class="av-section">
                <div class="av-circle">{{auth.currentUserValue?.fullName?.charAt(0)}}</div>
                <div style="flex:1;"><div style="font-size:18px;font-weight:600;">{{auth.currentUserValue?.fullName}}</div><div style="font-size:12px;color:var(--text3);">{{auth.currentUserValue?.email}}</div></div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div><div class="f-label">Full Name</div><input class="fi" [value]="auth.currentUserValue?.fullName"/></div>
                <div><div class="f-label">Email</div><input class="fi" [value]="auth.currentUserValue?.email" readonly/></div>
                <div><div class="f-label">Phone</div><input class="fi" value="+90 555 123 4567"/></div>
                <div><div class="f-label">Location</div><input class="fi" value="Istanbul, TR"/></div>
              </div>
              <div style="margin-top:32px;display:flex;justify-content:space-between;align-items:center;">
                <button class="save-btn">Save Changes</button>
                <button (click)="logout()" style="background:transparent;color:var(--red);border:none;cursor:pointer;font-size:13px;font-weight:500;">Sign Out</button>
              </div>
            </ng-container>
            <ng-container *ngIf="settingsTab === 'security'">
              <div style="margin-bottom:24px;"><div class="sec-title">Security</div><div style="font-size:12px;color:var(--text3);">Manage your password.</div></div>
              <div style="max-width:400px;display:flex;flex-direction:column;gap:16px;">
                <div><div class="f-label">Current Password</div><input type="password" class="fi" placeholder="••••••••"/></div>
                <div><div class="f-label">New Password</div><input type="password" class="fi" placeholder="Min. 8 characters"/></div>
                <button class="save-btn">Update Password</button>
              </div>
            </ng-container>
            <ng-container *ngIf="settingsTab === 'addresses'">
              <div style="margin-bottom:24px;"><div class="sec-title">Addresses</div><div style="font-size:12px;color:var(--text3);">Manage your shipping locations.</div></div>
              <div class="addr-card default">
                <div style="width:34px;height:34px;border-radius:8px;background:var(--glass2);display:flex;align-items:center;justify-content:center;"><svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M7.5 2C5.3 2 3.5 3.8 3.5 6c0 3.5 4 7 4 7s4-3.5 4-7c0-2.2-1.8-4-4-4Z" stroke="currentColor" stroke-width="1.1"/></svg></div>
                <div style="flex:1;"><div style="font-size:14px;font-weight:500;display:flex;align-items:center;gap:8px;">Home <span style="font-size:9px;padding:2px 6px;background:var(--teal-dim);color:var(--teal);border-radius:6px;border:1px solid rgba(62,207,178,0.2);">Default</span></div><div style="font-size:12px;color:var(--text2);margin-top:4px;line-height:1.5;">Istanbul, TR</div></div>
              </div>
            </ng-container>
            <ng-container *ngIf="settingsTab === 'notifications'">
              <div style="margin-bottom:24px;"><div class="sec-title">Notifications</div><div style="font-size:12px;color:var(--text3);">Choose how you want to be alerted.</div></div>
              <div style="background:var(--glass);border:1px solid var(--border);border-radius:16px;overflow:hidden;">
                <div class="notif-row"><div style="flex:1;"><div style="font-size:14px;font-weight:500;">Order Updates</div><div style="font-size:11px;color:var(--text3);">Real-time tracking of packages</div></div><div class="tog" [class.on]="notifPrefs.orders" (click)="notifPrefs.orders = !notifPrefs.orders"><div class="tog-thumb"></div></div></div>
                <div class="notif-row"><div style="flex:1;"><div style="font-size:14px;font-weight:500;">Marketing & Deals</div><div style="font-size:11px;color:var(--text3);">Price drops and offers</div></div><div class="tog" [class.on]="notifPrefs.marketing" (click)="notifPrefs.marketing = !notifPrefs.marketing"><div class="tog-thumb"></div></div></div>
              </div>
              <button class="save-btn" style="margin-top:24px;">Save Preferences</button>
            </ng-container>
            <ng-container *ngIf="settingsTab === 'danger'">
              <div style="color:var(--red);font-family:'Playfair Display';font-size:24px;font-style:italic;margin-bottom:16px;">Danger Zone</div>
              <div class="danger-box">
                <div class="dz-title">Delete My Account</div>
                <div class="dz-desc">Permanently remove your account and all associated data. This action is irreversible.</div>
                <button style="padding:10px 20px;border-radius:20px;border:1px solid var(--red-border);color:var(--red);background:transparent;cursor:pointer;">Deactivate Account</button>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </ng-container>

  </div>
</div>
  `,
})
export class ConsumerComponent implements OnInit {
  activeTab = 'home';
  settingsTab = 'personal';
  filtersOpen = true;
  selectedProduct: any = null;
  products: any[] = [];
  sentiments: any = {};
  prompt = '';
  chatMessages: any[] = [];
  history: string[] = [];
  searchQuery = '';
  maxPrice = 3000;
  minPrice = 0;
  selectedRating = 0;
  selectedCat = 'All';
  availability = { inStock: false, onSale: false };
  notifPrefs = { orders: true, marketing: false };
  categories: { name: string, checked: boolean }[] = [];
  brands: { name: string, checked: boolean }[] = [
    { name: 'Apple', checked: false },
    { name: 'Sony', checked: false },
    { name: 'Keychron', checked: false },
    { name: 'Logitech', checked: false },
    { name: 'LG', checked: false }
  ];
  wishlist: any[] = [];
  qty = 1;
  isTyping = false;
  chatSuggestions = ['Top selling products', 'Recommend a laptop for my budget', 'Order status', 'Discounted items', 'Apple vs Samsung compare'];
  consumerOrders: any[] = [];
  auth = inject(AuthService);
  ai = inject(AiService);
  productService = inject(ProductService);
  orderService = inject(OrderService);
  toast = inject(ToastService);
  router = inject(Router);

  get cartCount(): number {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      return cart.reduce((sum: number, i: any) => sum + (i.qty || i.quantity || 1), 0);
    } catch { return 0; }
  }

  get consumerTotalSpent(): number {
    return this.consumerOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }
  get consumerActiveOrders(): number {
    return this.consumerOrders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING' || o.status === 'SHIPPED').length;
  }
  get consumerDelivered(): number {
    return this.consumerOrders.filter(o => o.status === 'DELIVERED').length;
  }
  get consumerCancelled(): number {
    return this.consumerOrders.filter(o => o.status === 'CANCELLED').length;
  }
  get consumerAvgRating(): string {
    return '4.8';
  }

  reorder(order: any) {
    if (order?.items) {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      order.items.forEach((item: any) => {
        const existing = cart.find((c: any) => c.productId === item.product?.productId);
        if (existing) { existing.qty += item.quantity; }
        else { cart.push({ ...item.product, qty: item.quantity }); }
      });
      localStorage.setItem('cart', JSON.stringify(cart));
      this.toast.show('Items added to cart!');
      this.router.navigate(['/cart']);
    }
  }

  private getTimeNow(): string {
    const d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  ngOnInit() {
    const userName = this.auth.currentUserValue?.fullName || 'there';
    this.chatMessages.push({
      sender: 'ai',
      text: `Hello <strong>${userName}</strong>! 👋 I'm Nexus AI — your shopping assistant.<br><br>Ask me anything in natural language, and I'll analyze the database to find the best products for you.`,
      time: this.getTimeNow()
    });

    this.productService.getProducts().subscribe(res => {
      this.products = res;
      const cats = Array.from(new Set(this.products.map(p => p.category)));
      this.categories = cats.map((c: any) => ({ name: c, checked: false }));
    });

    this.orderService.getMyOrders().subscribe(res => {
      this.consumerOrders = res || [];
    });
  }

  get activeFilters() {
    const brandFilters = this.brands.filter(b => b.checked).map(b => b.name);
    const catFilters = this.categories.filter(c => c.checked).map(c => c.name);
    return [...brandFilters, ...catFilters];
  }

  get filteredProducts() {
    let list = this.products || [];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q)));
    }
    if (this.selectedCat !== 'All') {
      list = list.filter(p => p.category === this.selectedCat);
    }
    if (this.maxPrice < 3000 || this.minPrice > 0) {
      list = list.filter(p => p.basePrice <= this.maxPrice && p.basePrice >= this.minPrice);
    }
    const selBrands = this.brands.filter(b => b.checked).map(b => b.name);
    if (selBrands.length > 0) {
      list = list.filter(p => selBrands.includes(p.brand));
    }
    const selCats = this.categories.filter(c => c.checked).map(c => c.name);
    if (selCats.length > 0) {
      list = list.filter(p => selCats.includes(p.category));
    }
    if (this.availability.inStock) {
      list = list.filter(p => p.stockQuantity > 0);
    }
    return list;
  }

  removeChip(f: string) {
    const brand = this.brands.find(b => b.name === f);
    if (brand) brand.checked = false;
    const cat = this.categories.find(c => c.name === f);
    if (cat) cat.checked = false;
  }

  resetFilters() {
    this.maxPrice = 3000;
    this.minPrice = 0;
    this.selectedRating = 0;
    this.selectedCat = 'All';
    this.brands.forEach(b => b.checked = false);
    this.categories.forEach(c => c.checked = false);
    this.availability = { inStock: false, onSale: false };
    this.searchQuery = '';
  }

  selectProduct(p: any) {
    this.selectedProduct = p;
    this.activeTab = 'shop';
    this.qty = 1;
    this.checkSentiment(p);
  }

  checkSentiment(p: any) {
    this.productService.getSentiment(p.productId).subscribe(res => {
      this.sentiments[p.productId] = res;
    });
  }

  toggleWishlist(p: any) {
    const idx = this.wishlist.findIndex(w => w.productId === p.productId);
    if (idx >= 0) {
      this.wishlist.splice(idx, 1);
    } else {
      this.wishlist.push(p);
    }
  }

  addToCart(p: any) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let existing = cart.find((item: any) => item.productId === p.productId);
    if (existing) existing.qty++;
    else cart.push({ ...p, qty: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    this.toast.show(p.name + ' added to cart');
  }

  sendSuggestion(s: string) {
    this.prompt = s;
    this.sendQuery();
  }

  clearChat() {
    this.chatMessages = [];
    this.history = [];
    this.ai.clearSession();
    const userName = this.auth.currentUserValue?.fullName || 'there';
    this.chatMessages.push({
      sender: 'ai',
      text: `Hello <strong>${userName}</strong>! 👋 I'm Nexus AI — your shopping assistant.<br><br>Ask me anything in natural language.`,
      time: this.getTimeNow()
    });
  }

  streamSteps: string[] = [];

  sendQuery() {
    if (!this.prompt.trim()) return;
    const userMsg = this.prompt.trim();
    this.chatMessages.push({ sender: 'user', text: userMsg, time: this.getTimeNow() });
    this.prompt = '';
    this.isTyping = true;
    this.streamSteps = [];
    const user = this.auth.currentUserValue || { userId: 1, role: 'CONSUMER' };

    this.ai.queryStream(
      userMsg, user.userId, user.role, this.history,
      (step) => {
        this.streamSteps.push(step.message);
      },
      (res) => {
        this.isTyping = false;
        this.streamSteps = [];
        const aiMsg: any = {
          sender: 'ai',
          text: res.response,
          time: this.getTimeNow(),
          steps: ['Guardrails check', 'SQL generated', 'Query executed', 'Response formatted'],
          duration: '0.8s'
        };
        if (res.sql) aiMsg.sql = res.sql;
        if (res.data && res.data.length > 0) aiMsg.results = res.data;
        if (res.visualization) aiMsg.visualization = res.visualization;
        this.chatMessages.push(aiMsg);
        this.history.push('User: ' + userMsg, 'AI: ' + res.response);
        if (res.visualization) {
          setTimeout(() => this.renderPlotly(this.chatMessages.length - 1, res.visualization, res.data || []), 100);
        }
      },
      (err) => {
        this.isTyping = false;
        this.streamSteps = [];
        this.chatMessages.push({ sender: 'ai', text: 'Sorry, something went wrong. Please try again.', time: this.getTimeNow() });
      }
    );
  }

  private renderPlotly(msgIndex: number, vizCode: string, data: any[]) {
    const Plotly = (window as any)['Plotly'];
    if (!Plotly) return;
    const containerId = 'plotly-chart-' + msgIndex;
    try {
      const plotlyJson = JSON.parse(vizCode);
      if (plotlyJson.data) {
        const layout = { ...(plotlyJson.layout || {}), paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: '#7A918D' } };
        Plotly.newPlot(containerId, plotlyJson.data, layout, { responsive: true, displayModeBar: false });
        return;
      }
    } catch { /* not JSON, try executing as code */ }
    try {
      const fn = new Function('data', 'Plotly', 'containerId', vizCode.replace('fig.to_json()', `Plotly.newPlot(containerId, fig.data, {...fig.layout, paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)', font:{color:'#7A918D'}}, {responsive:true, displayModeBar:false})`));
      fn(data, Plotly, containerId);
    } catch { /* visualization rendering failed silently */ }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}


@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
<style>
:host{
  --bg:#080808;--glass:rgba(255,255,255,0.04);--glass2:rgba(255,255,255,0.07);
  --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.12);
  --teal:#3ECFB2;--teal2:#6EDEC8;--teal-dim:rgba(62,207,178,0.1);--teal-glow:rgba(62,207,178,0.18);
  --text:#E6F0EE;--text2:#6A8A84;--text3:#344844;
  --green:#3EC98A;--green-dim:rgba(62,201,138,0.08);--green-border:rgba(62,201,138,0.2);
  --red:#E07070;--red-dim:rgba(224,112,112,0.08);--red-border:rgba(224,112,112,0.2);
  --amber:#E8A94A;--amber-dim:rgba(232,169,74,0.08);
  --blue:#6BA8C8;--blue-dim:rgba(107,168,200,0.08);
}
.mp{background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--text);overflow:hidden;display:flex;flex-direction:column;height:100vh;}
.mn{display:flex;align-items:center;justify-content:space-between;padding:12px 22px;border-bottom:1px solid var(--border);background:rgba(8,8,8,0.95);backdrop-filter:blur(20px);flex-shrink:0;z-index:20;}
.mlogo{font-family:'Playfair Display',serif;font-style:italic;font-size:18px;color:var(--text);display:flex;align-items:center;gap:7px;}
.mlogo-dot{width:6px;height:6px;border-radius:50%;background:var(--teal);box-shadow:0 0 6px var(--teal-glow);}
.mbadge{background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);color:var(--teal2);font-size:9px;padding:2px 9px;border-radius:8px;letter-spacing:0.06em;text-transform:uppercase;}
.mnr{display:flex;align-items:center;gap:8px;}
.mni{width:32px;height:32px;border-radius:50%;background:var(--glass);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;}
.mnb{position:absolute;top:-2px;right:-2px;width:13px;height:13px;border-radius:50%;background:var(--red);color:#fff;font-size:7px;font-weight:700;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--bg);}
.mup{display:flex;align-items:center;gap:7px;padding:4px 11px 4px 4px;border-radius:20px;background:var(--glass);border:1px solid var(--border2);cursor:pointer;}
.muav{width:26px;height:26px;border-radius:50%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.25);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:var(--teal);}
.mbd{display:flex;flex:1;overflow:hidden;}
.msb{width:196px;min-width:196px;border-right:1px solid var(--border);display:flex;flex-direction:column;padding:14px 10px;background:rgba(8,8,8,0.5);}
.msl{font-size:8px;letter-spacing:0.14em;text-transform:uppercase;color:var(--text3);padding:0 10px;margin-bottom:5px;margin-top:12px;}
.msl:first-child{margin-top:0;}
.msi{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:20px;font-size:12.5px;color:var(--text2);cursor:pointer;transition:all 0.15s;margin-bottom:1px;justify-content:space-between;}
.msi.act{background:var(--teal-dim);color:var(--teal2);border:1px solid rgba(62,207,178,0.18);}
.msi:not(.act):hover{background:var(--glass2);color:var(--text);}
.msil{display:flex;align-items:center;gap:8px;}
.msib{font-size:9px;padding:1px 6px;border-radius:8px;background:var(--amber-dim);color:var(--amber);border:1px solid rgba(232,169,74,0.2);}
.msib.red{background:var(--red-dim);color:var(--red);border-color:var(--red-border);}
.msi-info{margin-top:auto;padding:10px;border-top:1px solid var(--border);}
.msi-card{background:var(--glass);border:1px solid rgba(62,207,178,0.15);border-radius:10px;padding:10px 12px;}
.msi-name{font-size:12px;font-weight:500;color:var(--text);margin-bottom:2px;}
.msi-status{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--green);}
.msi-dot{width:5px;height:5px;border-radius:50%;background:var(--green);box-shadow:0 0 4px rgba(62,201,138,0.4);}
.mmain{flex:1;overflow-y:auto;padding:18px 20px;}
.mmain::-webkit-scrollbar{width:2px;}
.mmain::-webkit-scrollbar-thumb{background:var(--border2);}
.mtb{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:16px;}
.mpt{font-family:'Playfair Display',serif;font-size:20px;font-style:italic;color:var(--text);}
.mps{font-size:11px;color:var(--text3);margin-top:3px;}
.mta{display:flex;gap:7px;}
.mtbtn{padding:7px 14px;border-radius:20px;font-size:11.5px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.15s;}
.mtbg{background:var(--glass);border:1px solid var(--border2);color:var(--text2);}
.mtbg:hover{color:var(--text);}
.mtbt{background:var(--teal);color:#080808;border:none;font-weight:600;}
.mtbt:hover{background:var(--teal2);}
.mkr{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;}
.mkpi{background:var(--glass);border:1px solid var(--border);border-radius:10px;padding:13px 14px;position:relative;overflow:hidden;}
.mkpi::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(62,207,178,0.18),transparent);}
.mkl{font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:6px;}
.mkv{font-family:'Playfair Display',serif;font-size:22px;color:var(--text);line-height:1;margin-bottom:4px;}
.mkv em{font-style:italic;color:var(--teal2);}
.mkd{font-size:10px;}
.mup-c{color:var(--green);}
.mdn{color:var(--red);}
.mcr{display:grid;grid-template-columns:1fr 200px;gap:10px;margin-bottom:12px;}
.mgc{background:var(--glass);border:1px solid var(--border);border-radius:10px;overflow:hidden;}
.mgh{padding:10px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.mgt{font-size:9.5px;letter-spacing:0.09em;text-transform:uppercase;color:var(--text2);}
.mgm{font-size:10px;color:var(--text3);}
.mgb{padding:12px 14px;}
.mbc{display:flex;align-items:flex-end;gap:5px;height:72px;}
.mbcc{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;}
.mbcb{width:100%;border-radius:3px 3px 0 0;background:rgba(62,207,178,0.15);cursor:pointer;}
.mbcb.hi{background:rgba(62,207,178,0.6);}
.mbcb:hover{background:rgba(62,207,178,0.35);}
.mbcl{font-size:8px;color:var(--text3);font-family:'JetBrains Mono',monospace;}
.mleg{display:flex;flex-direction:column;gap:6px;}
.mli{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--text2);}
.mld{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.mlp{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3);margin-left:auto;}
.mtc{background:var(--glass);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:10px;}
.mt{width:100%;border-collapse:collapse;}
.mt th{padding:8px 13px;font-size:8.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);text-align:left;font-weight:400;border-bottom:1px solid var(--border);}
.mt td{padding:8px 13px;font-size:12px;color:var(--text2);border-bottom:1px solid rgba(255,255,255,0.03);}
.mt tr:last-child td{border:none;}
.mt tr:hover td{background:rgba(255,255,255,0.015);}
.mtn{color:var(--text);font-weight:500;}
.mtm{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--teal);opacity:0.75;}
.mtp{font-family:'Playfair Display',serif;font-size:13px;color:var(--text);}
.msp{display:inline-flex;align-items:center;gap:3px;font-size:10px;padding:2px 8px;border-radius:10px;font-weight:500;}
.mspg{background:var(--green-dim);color:var(--green);}
.mspb{background:var(--blue-dim);color:var(--blue);}
.mspa{background:var(--amber-dim);color:var(--amber);}
.mspr{background:var(--red-dim);color:var(--red);}
.mpg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.mpc{background:var(--glass);border:1px solid var(--border);border-radius:10px;overflow:hidden;transition:border-color 0.15s;}
.mpc:hover{border-color:var(--border2);}
.mpci{height:72px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--border);}
.mpcb{padding:9px 11px;}
.mpcn{font-size:12px;font-weight:500;color:var(--text);margin-bottom:3px;}
.mpcpr{font-family:'Playfair Display',serif;font-size:14px;color:var(--text);}
.mpcrw{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.mpcs{font-size:10px;padding:2px 7px;border-radius:8px;}
.mpcsok{background:var(--green-dim);color:var(--green);}
.mpcsl{background:var(--amber-dim);color:var(--amber);}
.mpca{display:flex;gap:4px;}
.mpcbtn{flex:1;padding:5px 0;border-radius:6px;font-size:10.5px;cursor:pointer;text-align:center;border:1px solid var(--border);background:var(--glass2);color:var(--text2);transition:all 0.15s;font-family:'Plus Jakarta Sans',sans-serif;}
.mpcbtn:hover{color:var(--text);}
.mpcbtn.del:hover{color:var(--red);border-color:var(--red-border);}
.malert{display:flex;align-items:center;gap:10px;background:var(--amber-dim);border:1px solid rgba(232,169,74,0.18);border-radius:9px;padding:11px 14px;margin-bottom:12px;}
.malert-icon{width:28px;height:28px;border-radius:7px;background:rgba(232,169,74,0.1);border:1px solid rgba(232,169,74,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.malert-text{font-size:12.5px;color:var(--text2);flex:1;line-height:1.5;}
.malert-text strong{color:var(--amber);}
.malert-btn{font-size:11px;padding:5px 12px;border-radius:16px;background:rgba(232,169,74,0.1);border:1px solid rgba(232,169,74,0.2);color:var(--amber);cursor:pointer;white-space:nowrap;font-family:'Plus Jakarta Sans',sans-serif;}
.maf{background:var(--glass);border:1px solid var(--border);border-radius:10px;padding:18px;margin-bottom:10px;}
.mfg{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.mfl{font-size:10.5px;color:var(--text2);letter-spacing:0.02em;margin-bottom:5px;}
.mfi{background:rgba(255,255,255,0.04);border:1px solid var(--border2);border-radius:8px;padding:9px 12px;font-size:12.5px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;outline:none;width:100%;transition:border-color 0.2s;}
.mfi::placeholder{color:var(--text3);}
.mfi:focus{border-color:rgba(62,207,178,0.28);box-shadow:0 0 0 3px rgba(62,207,178,0.05);}
.mss{background:var(--glass);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:10px;}
.msr{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.03);}
.msr:last-child{border-bottom:none;}
.msrl{font-size:13px;color:var(--text);}
.msrd{font-size:11px;color:var(--text3);margin-top:1px;}
.mtog{width:36px;height:20px;border-radius:10px;position:relative;cursor:pointer;flex-shrink:0;}
.mtog.on{background:var(--teal-dim);border:1px solid rgba(62,207,178,0.25);}
.mtog.off{background:var(--glass2);border:1px solid var(--border2);}
.mtog-t{position:absolute;top:3px;width:12px;height:12px;border-radius:50%;transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);}
.mtog.on .mtog-t{left:20px;background:var(--teal);}
.mtog.off .mtog-t{left:3px;background:var(--text3);}
@keyframes mfadein{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:translateY(0);}}
.mkpi{animation:mfadein 0.35s ease both;opacity:0;}
.mkpi:nth-child(1){animation-delay:0.03s;}
.mkpi:nth-child(2){animation-delay:0.06s;}
.mkpi:nth-child(3){animation-delay:0.09s;}
.mkpi:nth-child(4){animation-delay:0.12s;}
</style>

<div class="mp">
  <!-- NAVBAR -->
  <div class="mn">
    <div style="display:flex;align-items:center;gap:10px;">
      <div class="mlogo"><div class="mlogo-dot"></div>Nexus</div>
      <div class="mbadge">Manager</div>
    </div>
    <div class="mnr">
      <div class="mni">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1.5C4.8 1.5 3 3.3 3 5.5V8l-1 1.5h10L11 8V5.5c0-2.2-1.8-4-4-4Z" stroke="#6A8A84" stroke-width="1.1"/><path d="M5.5 11c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5" stroke="#6A8A84" stroke-width="1.1"/></svg>
        <div class="mnb">3</div>
      </div>
      <div class="mup" (click)="logout()">
        <div class="muav">{{auth.currentUserValue?.fullName?.substring(0,2)?.toUpperCase()}}</div>
        <span style="font-size:12px;color:var(--text);font-weight:500;">{{auth.currentUserValue?.fullName}}</span>
        <span style="font-size:9px;color:var(--text3);">▾</span>
      </div>
    </div>
  </div>

  <div class="mbd">
    <!-- SIDEBAR -->
    <div class="msb">
      <div class="msl">Overview</div>
      <div class="msi" [class.act]="activePanel==='dashboard'" (click)="activePanel='dashboard'">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.6"/><rect x="7" y="1" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.4"/><rect x="1" y="7" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.4"/><rect x="7" y="7" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.3"/></svg>Dashboard</div>
      </div>
      <div class="msl">My Store</div>
      <div class="msi" [class.act]="activePanel==='products'" (click)="activePanel='products'">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L1 4v5l5.5 3L12 9V4L6.5 1Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>Products</div>
        <div class="msib">{{products.length}}</div>
      </div>
      <div class="msi" [class.act]="activePanel==='orders'" (click)="activePanel='orders'">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2h1.5l2 7h5.5l1.3-4.5H4.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="11" r="1" fill="currentColor"/><circle cx="9.5" cy="11" r="1" fill="currentColor"/></svg>Orders</div>
        <div class="msib red">5</div>
      </div>
      <div class="msi" [class.act]="activePanel==='inventory'" (click)="activePanel='inventory'">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 10V3h9v7H2Z" stroke="currentColor" stroke-width="1.1"/><path d="M5 6h3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Inventory<span *ngIf="lowStockProducts.length > 0" style="margin-left:auto;background:rgba(232,169,74,0.15);color:#E8A94A;font-size:9px;padding:1px 6px;border-radius:8px;">{{lowStockProducts.length}}</span></div>
      </div>
      <div class="msi" [class.act]="activePanel==='reviews'" (click)="activePanel='reviews'">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L8 5h4.5l-3.5 2.5 1.3 4.5L6.5 9.5 2.7 12l1.3-4.5L.5 5H5L6.5 1Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>Reviews</div>
      </div>
      <div class="msi" [class.act]="activePanel==='addprod'" (click)="activePanel='addprod'">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>Add Product</div>
      </div>
      <div class="msl">Analytics</div>
      <div class="msi" [class.act]="activePanel==='analytics'" (click)="activePanel='analytics'">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 10L4 6l3 2.5 5-6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>Performance</div>
      </div>
      <div class="msi" [class.act]="activePanel==='customers'" (click)="activePanel='customers'; loadSegments()">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.5" stroke="currentColor" stroke-width="1.1"/><path d="M1.5 11.5c0-2.7 2-4 5-4s5 1.3 5 4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Customers</div>
      </div>
      <div class="msl">Store</div>
      <div class="msi" [class.act]="activePanel==='settings'" (click)="activePanel='settings'">
        <div class="msil"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" stroke-width="1.1"/><path d="M6.5 1v1M6.5 11v1M1 6.5h1M11 6.5h1M2.6 2.6l.7.7M9.7 9.7l.7.7M2.6 10.4l.7-.7M9.7 3.3l.7-.7" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>Store Settings</div>
      </div>
      <div class="msi-info">
        <div class="msi-card">
          <div class="msi-name">{{auth.currentUserValue?.fullName}}'s Store</div>
          <div class="msi-status"><div class="msi-dot"></div>Open · Live</div>
        </div>
      </div>
    </div>

    <!-- MAIN -->
    <div class="mmain">

      <!-- INVENTORY ALERTS -->
      <ng-container *ngIf="activePanel==='inventory'">
        <div class="mtb"><div><div class="mpt">Inventory Alerts</div><div class="mps">{{lowStockProducts.length}} products need attention</div></div></div>
        <div class="mtc">
          <table class="mt"><thead><tr><th>Product</th><th>Category</th><th>Current Stock</th><th>Status</th></tr></thead>
          <tbody>
            <tr *ngFor="let p of lowStockProducts">
              <td class="mtn">{{p.name}}</td>
              <td>{{p.category}}</td>
              <td class="mtp">{{p.stockQuantity}}</td>
              <td><span class="msp" [class.mspa]="p.stockQuantity <= 5" [class.mspb]="p.stockQuantity > 5">{{p.stockQuantity <= 5 ? '⚠ Critical' : 'Low'}}</span></td>
            </tr>
            <tr *ngIf="lowStockProducts.length === 0"><td colspan="4" style="text-align:center;color:var(--text3);padding:32px;">All products are well stocked.</td></tr>
          </tbody></table>
        </div>
      </ng-container>

      <!-- REVIEWS -->
      <ng-container *ngIf="activePanel==='reviews'">
        <div class="mtb"><div><div class="mpt">Customer Reviews</div><div class="mps">{{reviews.length}} reviews · Manage product feedback</div></div></div>
        <div class="mtc" *ngIf="reviews.length > 0">
          <table class="mt">
            <thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Comment</th><th>Sentiment</th><th>Response</th><th>Action</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of reviews">
                <td class="mtn">{{r.product?.name || 'N/A'}}</td>
                <td>{{r.user?.fullName || 'Anonymous'}}</td>
                <td style="color:#E8A94A;">{{r.rating}}★</td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:var(--text3);">{{r.comment || '—'}}</td>
                <td><span style="padding:2px 6px;border-radius:4px;font-size:10px;" [style.background]="(r.sentimentScore || 0) >= 0.6 ? 'rgba(62,207,178,0.12)' : (r.sentimentScore || 0) <= 0.3 ? 'rgba(224,112,112,0.12)' : 'rgba(232,169,74,0.12)'" [style.color]="(r.sentimentScore || 0) >= 0.6 ? '#3ECFB2' : (r.sentimentScore || 0) <= 0.3 ? '#E07070' : '#E8A94A'">{{r.sentimentScore || 0 | number:'1.1-1'}}</span></td>
                <td style="max-width:150px;font-size:11px;color:var(--text3);">{{r.storeResponse || '—'}}</td>
                <td>
                  <div *ngIf="!r.storeResponse" class="mtbtn mtbt" style="font-size:9px;padding:4px 8px;" (click)="respondToReview(r)">Reply</div>
                  <span *ngIf="r.storeResponse" style="font-size:10px;color:#3ECFB2;">✓ Replied</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div *ngIf="reviews.length === 0" style="text-align:center;padding:48px;color:var(--text3);font-size:12px;">
          No reviews yet for your products.
        </div>
      </ng-container>

      <!-- DASHBOARD -->
      <ng-container *ngIf="activePanel==='dashboard'">
        <div class="mtb">
          <div><div class="mpt">My Store Dashboard</div><div class="mps">{{products.length}} products · {{storeOrders.length}} orders</div></div>
          <div class="mta"><div class="mtbtn mtbg">Download Report</div><div class="mtbtn mtbt" (click)="activePanel='addprod'">+ Add Product</div></div>
        </div>
        <div class="malert" *ngIf="lowStockProducts.length > 0">
          <div class="malert-icon"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5L1.5 12h11L7 1.5Z" stroke="#E8A94A" stroke-width="1.1" stroke-linejoin="round"/><path d="M7 6v3M7 11v.3" stroke="#E8A94A" stroke-width="1.1" stroke-linecap="round"/></svg></div>
          <div class="malert-text"><strong>{{lowStockProducts.length}} products low on stock</strong> — {{lowStockAlert}}</div>
          <div class="malert-btn" (click)="activePanel='products'">View Products</div>
        </div>
        <div class="mkr">
          <div class="mkpi"><div class="mkl">Store Revenue</div><div class="mkv">{{filteredRevenue | currency:'USD':'symbol':'1.0-0'}}</div><div class="mkd mup-c">{{filteredOrders.length}} orders</div></div>
          <div class="mkpi"><div class="mkl">Orders</div><div class="mkv">{{storeOrders.length}}</div><div class="mkd mup-c">{{pendingOrders.length}} pending</div></div>
          <div class="mkpi"><div class="mkl">Active Products</div><div class="mkv">{{products.length}}</div><div class="mkd mup-c">{{lowStockProducts.length}} low stock</div></div>
          <div class="mkpi"><div class="mkl">Reviews</div><div class="mkv">{{reviews.length}}</div><div class="mkd mup-c">Avg {{avgReviewRating}}★</div></div>
        </div>
        <div class="mcr">
          <div class="mgc">
            <div class="mgh"><div class="mgt">Monthly Revenue</div><div class="mgm">Peak: March · $28K</div></div>
            <div class="mgb">
              <div class="mbc">
                <div class="mbcc" *ngFor="let b of [{h:38,l:'J'},{h:52,l:'F'},{h:100,l:'M',hi:true},{h:75,l:'A'},{h:62,l:'M'},{h:70,l:'J'},{h:55,l:'J'},{h:80,l:'A'},{h:66,l:'S'},{h:90,l:'O'},{h:72,l:'N'},{h:45,l:'D'}]">
                  <div class="mbcb" [class.hi]="b.hi" [style.height.%]="b.h"></div>
                  <div class="mbcl" [style.color]="b.hi ? 'var(--teal2)' : ''">{{b.l}}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="mgc">
            <div class="mgh"><div class="mgt">Category Split</div></div>
            <div class="mgb">
              <div style="display:flex;justify-content:center;margin-bottom:10px;">
                <svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="28" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="12"/><circle cx="40" cy="40" r="28" fill="none" stroke="#3ECFB2" stroke-width="12" stroke-dasharray="88 88" stroke-dashoffset="0" transform="rotate(-90 40 40)"/><circle cx="40" cy="40" r="28" fill="none" stroke="#6BA8C8" stroke-width="12" stroke-dasharray="35 141" stroke-dashoffset="-88" transform="rotate(-90 40 40)"/><circle cx="40" cy="40" r="28" fill="none" stroke="#E8A94A" stroke-width="12" stroke-dasharray="23 153" stroke-dashoffset="-123" transform="rotate(-90 40 40)"/><text x="40" y="43" text-anchor="middle" fill="#E6F0EE" font-size="10" font-family="Playfair Display" font-style="italic">$218K</text></svg>
              </div>
              <div class="mleg">
                <div class="mli"><div class="mld" style="background:var(--teal)"></div>Electronics<div class="mlp">50%</div></div>
                <div class="mli"><div class="mld" style="background:var(--blue)"></div>Accessories<div class="mlp">20%</div></div>
                <div class="mli"><div class="mld" style="background:var(--amber)"></div>Peripherals<div class="mlp">13%</div></div>
              </div>
            </div>
          </div>
        </div>
        <div class="mtc">
          <div class="mgh"><div class="mgt">Recent Orders</div><div class="mgm" style="cursor:pointer;" (click)="activePanel='orders'">View all →</div></div>
          <table class="mt"><thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            <tr *ngFor="let o of storeOrders.slice(0,5)">
              <td class="mtm">#{{o.orderId}}</td>
              <td class="mtn">{{o.user?.fullName || 'Customer'}}</td>
              <td>{{o.items?.length || 0}} items</td>
              <td class="mtp">{{o.totalAmount | currency}}</td>
              <td><span class="msp" [class.mspg]="o.status==='DELIVERED'" [class.mspb]="o.status==='SHIPPED' || o.status==='PROCESSING'" [class.mspa]="o.status==='PENDING'">{{o.status}}</span></td>
            </tr>
            <tr *ngIf="storeOrders.length === 0"><td colspan="5" style="text-align:center;color:var(--text3);">No orders yet</td></tr>
          </tbody></table>
        </div>
      </ng-container>

      <!-- PRODUCTS -->
      <ng-container *ngIf="activePanel==='products'">
        <div class="mtb">
          <div><div class="mpt">My Products</div><div class="mps">{{products.length}} active listings</div></div>
          <div class="mta"><div class="mtbtn mtbg">Import CSV</div><div class="mtbtn mtbt" (click)="activePanel='addprod'">+ Add Product</div></div>
        </div>
        <div class="mpg">
          <div class="mpc" *ngFor="let p of products">
            <div class="mpci" style="background:rgba(62,207,178,0.04);">
              <img *ngIf="p.imageUrl" [src]="p.imageUrl" style="max-width:60%;max-height:60%;object-fit:contain;"/>
              <svg *ngIf="!p.imageUrl" width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="4" y="11" width="36" height="22" rx="3.5" stroke="#3ECFB2" stroke-width="1.1" opacity="0.5"/></svg>
            </div>
            <div class="mpcb">
              <div class="mpcn">{{p.name}}</div>
              <div class="mpcrw"><div class="mpcpr">{{p.basePrice | currency}}</div><div class="mpcs" [class.mpcsok]="p.stockQuantity > 10" [class.mpcsl]="p.stockQuantity <= 10">{{p.stockQuantity > 10 ? p.stockQuantity + ' in stock' : p.stockQuantity + ' left'}}</div></div>
              <div class="mpca"><div class="mpcbtn">Edit</div><div class="mpcbtn">Stats</div><div class="mpcbtn del" (click)="deleteProduct(p)">Delete</div></div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ORDERS -->
      <ng-container *ngIf="activePanel==='orders'">
        <div class="mtb">
          <div><div class="mpt">Store Orders</div><div class="mps">{{pendingOrders.length}} pending action</div></div>
          <div class="mta"><div class="mtbtn mtbg">Export</div></div>
        </div>
        <div class="mtc">
          <table class="mt"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            <tr *ngFor="let o of storeOrders">
              <td class="mtm">#ORD-{{o.orderId}}</td>
              <td class="mtn">{{o.user?.fullName || 'N/A'}}</td>
              <td>{{o.items?.length || 0}}</td>
              <td class="mtp">{{o.totalAmount | currency}}</td>
              <td>{{o.orderDate | date:'mediumDate'}}</td>
              <td><span class="msp" [class.mspg]="o.status === 'DELIVERED'" [class.mspb]="o.status === 'SHIPPED' || o.status === 'PROCESSING'" [class.mspa]="o.status === 'PENDING'">{{o.status}}</span></td>
            </tr>
            <tr *ngIf="storeOrders.length === 0"><td colspan="6" style="text-align:center;color:var(--text3);padding:32px;">No orders yet.</td></tr>
          </tbody></table>
        </div>
      </ng-container>

      <!-- ADD PRODUCT -->
      <ng-container *ngIf="activePanel==='addprod'">
        <div class="mtb">
          <div><div class="mpt">Add New Product</div><div class="mps">Store listing</div></div>
          <div class="mta"><div class="mtbtn mtbg">Save Draft</div><div class="mtbtn mtbt" (click)="submitProduct()">Publish</div></div>
        </div>
        <div class="maf">
          <div class="mfg" style="margin-bottom:12px;">
            <div><div class="mfl">Product Name</div><input class="mfi" [(ngModel)]="newProd.name" placeholder="e.g. MacBook Pro 14&quot; M3"/></div>
            <div><div class="mfl">Brand</div><input class="mfi" [(ngModel)]="newProd.brand" placeholder="e.g. Apple"/></div>
            <div><div class="mfl">Price ($)</div><input class="mfi" [(ngModel)]="newProd.basePrice" placeholder="0.00" type="number"/></div>
            <div><div class="mfl">Stock Quantity</div><input class="mfi" [(ngModel)]="newProd.stockQuantity" placeholder="0" type="number"/></div>
            <div><div class="mfl">Category</div><input class="mfi" [(ngModel)]="newProd.category" placeholder="e.g. Electronics"/></div>
            <div><div class="mfl">SKU / Barcode</div><input class="mfi" placeholder="e.g. APP-MBP-14-M3" style="font-family:'JetBrains Mono',monospace;"/></div>
          </div>
          <div style="margin-bottom:12px;"><div class="mfl">Description</div><textarea class="mfi" rows="3" style="resize:none;" [(ngModel)]="newProd.description" placeholder="Product description, key features..."></textarea></div>
        </div>
      </ng-container>

      <!-- CUSTOMERS SEGMENTATION -->
      <ng-container *ngIf="activePanel==='customers'">
        <div class="mtb"><div><div class="mpt">Customer Insights</div><div class="mps">Segmentation & behavior analysis</div></div></div>
        <div *ngIf="!segments" style="text-align:center;padding:48px;color:var(--text3);font-size:12px;">Loading...</div>
        <ng-container *ngIf="segments">
          <div class="mkr">
            <div class="mkpi"><div class="mkl">Total Customers</div><div class="mkv">{{segments.totalCustomers}}</div></div>
            <div class="mkpi"><div class="mkl">Avg. Spend</div><div class="mkv">{{segments.avgSpend | currency:'USD':'symbol':'1.0-0'}}</div></div>
            <div class="mkpi"><div class="mkl">Segments</div><div class="mkv">{{segmentKeys(segments.byMembership).length}}</div></div>
            <div class="mkpi"><div class="mkl">Top City</div><div class="mkv" style="font-size:16px;">{{segmentKeys(segments.byCity)[0] || '—'}}</div></div>
          </div>
          <div class="mcr">
            <div class="mgc" style="flex:1;">
              <div class="mgh"><div class="mgt">By Membership Type</div></div>
              <div style="padding:16px;">
                <div *ngFor="let key of segmentKeys(segments.byMembership)" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">
                  <span style="font-size:12px;">{{key}}</span>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div style="height:6px;border-radius:3px;background:var(--teal);opacity:0.7;" [style.width.px]="segments.byMembership[key] * 4"></div>
                    <span style="font-size:11px;color:var(--text3);min-width:24px;text-align:right;">{{segments.byMembership[key]}}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="mgc" style="flex:1;">
              <div class="mgh"><div class="mgt">By Spending Tier</div></div>
              <div style="padding:16px;">
                <div *ngFor="let key of segmentKeys(segments.bySpendTier)" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">
                  <span style="font-size:12px;">{{key}}</span>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div style="height:6px;border-radius:3px;background:#6BA8C8;opacity:0.7;" [style.width.px]="segments.bySpendTier[key] * 4"></div>
                    <span style="font-size:11px;color:var(--text3);min-width:24px;text-align:right;">{{segments.bySpendTier[key]}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mtc">
            <div class="mgh"><div class="mgt">Top Cities</div></div>
            <table class="mt">
              <thead><tr><th>City</th><th>Customers</th></tr></thead>
              <tbody><tr *ngFor="let key of segmentKeys(segments.byCity)"><td class="mtn">{{key}}</td><td>{{segments.byCity[key]}}</td></tr></tbody>
            </table>
          </div>
        </ng-container>
      </ng-container>

      <!-- ANALYTICS -->
      <ng-container *ngIf="activePanel==='analytics'">
        <div class="mtb">
          <div><div class="mpt">Store Performance</div><div class="mps">Sales analytics & revenue</div></div>
          <div class="mta" style="display:flex;gap:8px;align-items:center;">
            <input type="date" [(ngModel)]="analyticsDateFrom" (change)="applyDateFilter()" style="background:var(--card);border:1px solid var(--border);color:var(--text);padding:6px 10px;border-radius:6px;font-size:11px;"/>
            <span style="color:var(--text3);font-size:11px;">to</span>
            <input type="date" [(ngModel)]="analyticsDateTo" (change)="applyDateFilter()" style="background:var(--card);border:1px solid var(--border);color:var(--text);padding:6px 10px;border-radius:6px;font-size:11px;"/>
            <div class="mtbtn mtbg" (click)="resetDateFilter()" style="font-size:10px;padding:6px 12px;">Reset</div>
          </div>
        </div>
        <div class="mkr">
          <div class="mkpi"><div class="mkl">Revenue (Filtered)</div><div class="mkv">{{filteredRevenue | currency:'USD':'symbol':'1.0-0'}}</div><div class="mkd mup-c">{{filteredOrders.length}} orders</div></div>
          <div class="mkpi"><div class="mkl">Total Orders</div><div class="mkv">{{filteredOrders.length}}</div><div class="mkd mup-c">In range</div></div>
          <div class="mkpi"><div class="mkl">Avg Order Value</div><div class="mkv">{{filteredOrders.length > 0 ? (filteredRevenue / filteredOrders.length | currency:'USD':'symbol':'1.0-0') : '$0'}}</div><div class="mkd mup-c">Per order</div></div>
          <div class="mkpi"><div class="mkl">Low Stock Items</div><div class="mkv">{{lowStockProducts.length}}</div><div class="mkd" [class.mdn]="lowStockProducts.length > 0" [class.mup-c]="lowStockProducts.length === 0">{{lowStockProducts.length > 0 ? '⚠ Alert' : '✓ OK'}}</div></div>
        </div>
        <div class="mcr">
          <div class="mgc" style="flex:2;">
            <div class="mgh"><div class="mgt">Revenue by Month</div></div>
            <div class="mgb" style="height:260px;"><canvas #mgrRevenueChart></canvas></div>
          </div>
          <div class="mgc" style="flex:1;">
            <div class="mgh"><div class="mgt">Category Split</div></div>
            <div class="mgb" style="height:260px;"><canvas #mgrCategoryChart></canvas></div>
          </div>
        </div>
        <div class="mtc">
          <div class="mgh"><div class="mgt">Products by Price</div></div>
          <table class="mt"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead>
          <tbody>
            <tr *ngFor="let p of products.slice(0,8)"><td class="mtn">{{p.name}}</td><td>{{p.category}}</td><td class="mtp">{{p.basePrice | currency}}</td><td [style.color]="p.stockQuantity <= 10 ? '#E8A94A' : 'var(--text2)'">{{p.stockQuantity}}</td></tr>
          </tbody></table>
        </div>
      </ng-container>

      <!-- SETTINGS -->
      <ng-container *ngIf="activePanel==='settings'">
        <div class="mtb">
          <div><div class="mpt">Store Settings</div><div class="mps">Configuration</div></div>
          <div class="mta"><div class="mtbtn mtbt">Save Changes</div></div>
        </div>
        <div class="mss">
          <div style="padding:12px 16px;border-bottom:1px solid var(--border);"><div style="font-size:9.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);">Store Status</div></div>
          <div class="msr"><div><div class="msrl">Store Open</div><div class="msrd">Customers can browse and purchase</div></div><div class="mtog" [class.on]="storeSettings.open" [class.off]="!storeSettings.open" (click)="storeSettings.open=!storeSettings.open"><div class="mtog-t"></div></div></div>
          <div class="msr"><div><div class="msrl">Accept New Orders</div><div class="msrd">Toggle off to pause incoming orders</div></div><div class="mtog" [class.on]="storeSettings.acceptOrders" [class.off]="!storeSettings.acceptOrders" (click)="storeSettings.acceptOrders=!storeSettings.acceptOrders"><div class="mtog-t"></div></div></div>
          <div class="msr"><div><div class="msrl">Auto-confirm Orders</div><div class="msrd">Skip manual approval for verified customers</div></div><div class="mtog" [class.on]="storeSettings.autoConfirm" [class.off]="!storeSettings.autoConfirm" (click)="storeSettings.autoConfirm=!storeSettings.autoConfirm"><div class="mtog-t"></div></div></div>
        </div>
        <div class="mss">
          <div style="padding:12px 16px;border-bottom:1px solid var(--border);"><div style="font-size:9.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);">Notifications</div></div>
          <div class="msr"><div><div class="msrl">New Order Alerts</div><div class="msrd">Email + push when order placed</div></div><div class="mtog" [class.on]="storeSettings.newOrderAlerts" [class.off]="!storeSettings.newOrderAlerts" (click)="storeSettings.newOrderAlerts=!storeSettings.newOrderAlerts"><div class="mtog-t"></div></div></div>
          <div class="msr"><div><div class="msrl">Low Stock Warnings</div><div class="msrd">Alert when stock drops below 5</div></div><div class="mtog" [class.on]="storeSettings.lowStockWarnings" [class.off]="!storeSettings.lowStockWarnings" (click)="storeSettings.lowStockWarnings=!storeSettings.lowStockWarnings"><div class="mtog-t"></div></div></div>
        </div>
      </ng-container>

    </div>
  </div>
</div>
  `
})
export class ManagerComponent implements OnInit, AfterViewInit {
  products: any[] = [];
  storeOrders: any[] = [];
  reviews: any[] = [];
  activePanel = 'dashboard';
  newProd: any = { name: '', brand: '', basePrice: 0, stockQuantity: 10, category: 'Electronics', description: '' };
  storeSettings = { open: true, acceptOrders: true, autoConfirm: false, newOrderAlerts: true, lowStockWarnings: true };
  analyticsDateFrom = '';
  analyticsDateTo = '';
  filteredOrders: any[] = [];
  segments: any = null;
  productService = inject(ProductService);
  orderService = inject(OrderService);
  adminService = inject(AdminService);
  auth = inject(AuthService);
  toast = inject(ToastService);
  router = inject(Router);

  @ViewChild('mgrRevenueChart') revenueCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mgrCategoryChart') categoryCanvas!: ElementRef<HTMLCanvasElement>;
  private revenueChart: Chart | null = null;
  private categoryChart: Chart | null = null;

  ngOnInit() {
    this.productService.getProducts().subscribe(res => {
      this.products = res;
      this.buildCategoryChart();
    });
    this.orderService.getMyOrders().subscribe(res => {
      this.storeOrders = res;
      this.filteredOrders = [...res];
      this.buildRevenueChart();
    });
    this.productService.getAllReviews().subscribe(res => this.reviews = res);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.buildRevenueChart();
      this.buildCategoryChart();
    }, 500);
  }

  private buildRevenueChart() {
    if (!this.revenueCanvas?.nativeElement) return;
    if (this.revenueChart) this.revenueChart.destroy();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueByMonth = new Array(12).fill(0);
    this.storeOrders.forEach((o: any) => {
      const d = new Date(o.orderDate);
      if (!isNaN(d.getTime())) revenueByMonth[d.getMonth()] += o.totalAmount || 0;
    });
    this.revenueChart = new Chart(this.revenueCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Revenue ($)',
          data: revenueByMonth,
          backgroundColor: 'rgba(62,207,178,0.35)',
          borderColor: '#3ECFB2',
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#7A918D' }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { ticks: { color: '#7A918D' }, grid: { color: 'rgba(255,255,255,0.04)' } }
        }
      }
    });
  }

  private buildCategoryChart() {
    if (!this.categoryCanvas?.nativeElement) return;
    if (this.categoryChart) this.categoryChart.destroy();
    const catMap: Record<string, number> = {};
    this.products.forEach((p: any) => { catMap[p.category || 'Other'] = (catMap[p.category || 'Other'] || 0) + 1; });
    const labels = Object.keys(catMap);
    const data = Object.values(catMap);
    const palette = ['#3ECFB2', '#6BA8C8', '#E8A94A', '#E07070', '#A78BFA', '#34D399', '#F472B6'];
    this.categoryChart = new Chart(this.categoryCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: palette.slice(0, labels.length), borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#7A918D', padding: 12, font: { size: 10 } } } }
      }
    });
  }

  get lowStockProducts() {
    return this.products.filter(p => p.stockQuantity <= 10);
  }

  get totalRevenue(): number {
    return this.storeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  get filteredRevenue(): number {
    return this.filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  applyDateFilter() {
    const from = this.analyticsDateFrom ? new Date(this.analyticsDateFrom) : null;
    const to = this.analyticsDateTo ? new Date(this.analyticsDateTo) : null;
    if (to) to.setHours(23, 59, 59);
    this.filteredOrders = this.storeOrders.filter(o => {
      const d = new Date(o.orderDate);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }

  resetDateFilter() {
    this.analyticsDateFrom = '';
    this.analyticsDateTo = '';
    this.filteredOrders = [...this.storeOrders];
  }

  respondToReview(r: any) {
    const response = prompt('Write your reply to this review:');
    if (response && response.trim()) {
      this.productService.respondToReview(r.reviewId, response.trim()).subscribe({
        next: (updated) => {
          r.storeResponse = updated.storeResponse;
          r.respondedAt = updated.respondedAt;
          this.toast.show('Reply submitted');
        },
        error: () => this.toast.show('Failed to submit reply', 'error')
      });
    }
  }

  loadSegments() {
    if (this.segments) return;
    this.adminService.getCustomerSegments().subscribe({
      next: (data) => this.segments = data,
      error: () => this.toast.show('Failed to load segments', 'error')
    });
  }

  segmentKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  get lowStockAlert(): string {
    return this.lowStockProducts.slice(0, 3).map((p: any) => p.name + ' (' + p.stockQuantity + ' left)').join(', ');
  }

  get avgReviewRating(): string {
    if (!this.reviews?.length) return '—';
    const sum = this.reviews.reduce((s: number, r: any) => s + (Number(r.rating) || 0), 0);
    return (sum / this.reviews.length).toFixed(1);
  }

  get pendingOrders() {
    return this.storeOrders.filter(o => o.status === 'PENDING');
  }

  submitProduct() {
    if (!this.newProd.name) return;
    this.productService.createProduct(this.newProd).subscribe({
      next: (res) => {
        this.products.push(res);
        this.toast.show('Product added successfully!');
        this.newProd = { name: '', brand: '', basePrice: 0, stockQuantity: 10, category: 'Electronics', description: '' };
        this.activePanel = 'products';
      },
      error: () => this.toast.show('Failed to add product', 'error')
    });
  }

  addProduct() {
    this.activePanel = 'addprod';
  }

  deleteProduct(p: any) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.productService.deleteProduct(p.productId).subscribe({
      next: () => {
        this.products = this.products.filter(item => item.productId !== p.productId);
        this.toast.show('Product deleted');
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
<style>
.admin-page { background:var(--bg); color:var(--text); min-height:100vh; display:flex; flex-direction:column; overflow:hidden; }
.navbar-a { display:flex; align-items:center; justify-content:space-between; padding:12px 24px; border-bottom:1px solid var(--border); background:rgba(8,8,8,0.95); backdrop-filter:blur(20px); flex-shrink:0; z-index:100; }
.logo-a { font-family:'Playfair Display',serif; font-style:italic; font-size:18px; color:var(--text); display:flex; align-items:center; gap:8px; }
.logo-dot-a { width:6px; height:6px; border-radius:50%; background:var(--teal); box-shadow:0 0 8px var(--teal-glow); }
.badge-a { background:var(--teal-dim); border:1px solid rgba(62,207,178,0.2); color:var(--teal); font-size:9px; padding:2px 8px; border-radius:8px; text-transform:uppercase; letter-spacing:0.06em; }
.nav-r-a { display:flex; align-items:center; gap:12px; }
.nav-av-a { width:30px; height:30px; border-radius:50%; background:var(--teal-dim); border:1px solid rgba(62,207,178,0.2); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; color:var(--teal); }

.body-a { display:flex; flex:1; overflow:hidden; }
.sidebar-a { width:200px; min-width:200px; border-right:1px solid var(--border); background:rgba(8,8,8,0.4); display:flex; flex-direction:column; padding:16px 10px; }
.sg-label-a { font-size:8.5px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text3); padding:0 12px; margin:14px 0 6px; }
.sg-label-a:first-child { margin-top:0; }
.sitem-a { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:12px; font-size:13px; color:var(--text2); cursor:pointer; transition:all 0.2s; margin-bottom:2px; justify-content:space-between; }
.sitem-a.active { background:var(--teal-dim); color:var(--teal2); border:1px solid rgba(62,207,178,0.15); }
.sitem-a:not(.active):hover { background:var(--glass); color:var(--text); }
.sitem-l-a { display:flex; align-items:center; gap:10px; }
.sitem-badge-a { font-size:9px; padding:1px 6px; border-radius:8px; background:var(--glass2); color:var(--text2); }
.sitem-badge-a.green { background:var(--teal-dim); color:var(--teal); }

.sidebar-foot-a { margin-top:auto; padding-top:12px; border-top:1px solid var(--border); }
.s-user-a { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:12px; transition:all 0.2s; cursor:pointer; }
.s-user-a:hover { background:var(--glass); }
.su-name-a { font-size:12px; font-weight:500; color:var(--text); }
.su-role-a { font-size:10px; color:var(--text3); }

.main-a { flex:1; overflow-y:auto; padding:24px; position:relative; }
.panel-a { display:none; animation:fade-up 0.4s ease forwards; }
.panel-a.active { display:block; }
@keyframes fade-up { from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:translateY(0);} }

.top-bar-a { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:24px; }
.page-title-a { font-family:'Playfair Display',serif; font-size:24px; font-style:italic; font-weight:400; color:var(--text); }
.page-sub-a { font-size:12px; color:var(--text3); margin-top:4px; }
.top-actions-a { display:flex; gap:8px; }
.tbtn-a { padding:8px 16px; border-radius:20px; font-size:12px; cursor:pointer; font-family:inherit; transition:all 0.2s; }
.tbtn-ghost-a { background:var(--glass); border:1px solid var(--border2); color:var(--text2); }
.tbtn-ghost-a:hover { color:var(--text); border-color:var(--text3); }
.tbtn-primary-a { background:var(--teal); border:none; color:#080808; font-weight:600; }
.tbtn-primary-a:hover { background:var(--teal2); transform:translateY(-1px); }

.kpi-row-a { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
.kpi-a { background:var(--glass); border:1px solid var(--border); border-radius:14px; padding:18px 20px; transition:all 0.3s; }
.kpi-a:hover { border-color:var(--teal-dim); transform:translateY(-2px); }
.kpi-label-a { font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); margin-bottom:8px; }
.kpi-val-a { font-family:'Playfair Display',serif; font-size:26px; color:var(--text); line-height:1; font-weight:400; }
.kpi-delta-a { font-size:11px; margin-top:8px; display:flex; align-items:center; gap:4px; }
.up-a { color:var(--green); }
.dn-a { color:var(--red); }

.chart-row-a { display:grid; grid-template-columns:1fr 280px; gap:16px; margin-bottom:24px; }
.gcard-a { background:var(--glass); border:1px solid var(--border); border-radius:14px; overflow:hidden; }
.gc-head-a { padding:14px 20px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
.gc-title-a { font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--text2); font-weight:600; }
.gc-link-a { font-size:11px; color:var(--text3); cursor:pointer; }
.gc-body-a { padding:20px; }

.bar-chart-a { display:flex; align-items:flex-end; gap:8px; height:120px; }
.bc-col-a { display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; }
.bc-bar-a { width:100%; border-radius:4px 4px 0 0; background:rgba(62,207,178,0.12); transition:all 0.4s; position:relative; }
.bc-bar-a:hover { background:rgba(62,207,178,0.3); }
.bc-bar-a.active { background:var(--teal); box-shadow:0 0 15px var(--teal-glow); }
.bc-label-a { font-size:9px; color:var(--text3); font-family:'JetBrains Mono',monospace; }

.donut-wrap-a { display:flex; align-items:center; gap:20px; }
.donut-legend-a { display:flex; flex-direction:column; gap:10px; }
.dl-item-a { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--text2); }
.dl-dot-a { width:8px; height:8px; border-radius:50%; }

.table-card-a { background:var(--glass); border:1px solid var(--border); border-radius:14px; overflow:hidden; margin-bottom:24px; }
.tbl-a { width:100%; border-collapse:collapse; }
.tbl-a th { padding:12px 20px; text-align:left; font-size:9px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text3); border-bottom:1px solid var(--border); font-weight:600; }
.tbl-a td { padding:14px 20px; font-size:13px; color:var(--text2); border-bottom:1px solid rgba(255,255,255,0.03); }
.tbl-a tr:last-child td { border-bottom:none; }
.tbl-a tr:hover td { background:rgba(255,255,255,0.02); }
.td-mono-a { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--teal2); }
.td-name-a { color:var(--text); font-weight:500; }
.spill-a { display:inline-flex; align-items:center; gap:6px; font-size:11px; padding:3px 10px; border-radius:20px; font-weight:500; }
.sp-green-a { background:var(--green-dim); color:var(--green); }
.sp-blue-a { background:rgba(107,168,200,0.1); color:var(--blue); }
.sp-amber-a { background:rgba(232,169,74,0.1); color:var(--amber); }

.store-grid-a { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
.store-card-a { background:var(--glass); border:1px solid var(--border); border-radius:14px; padding:20px; transition:all 0.3s; }
.store-card-a:hover { border-color:var(--teal-dim); transform:translateY(-2px); }
.sc-top-a { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; }
.sc-name-a { font-size:15px; font-weight:600; color:var(--text); }
.sc-owner-a { font-size:11px; color:var(--text3); margin-top:2px; }
.sc-status-a { font-size:10px; padding:3px 10px; border-radius:20px; display:inline-flex; align-items:center; gap:5px; }
.sc-status-a.open { background:var(--green-dim); color:var(--green); border:1px solid rgba(62,201,138,0.2); }
.sc-status-a.closed { background:var(--red-dim); color:var(--red); border:1px solid var(--red-border); }
.sc-dot-a { width:6px; height:6px; border-radius:50%; }
.sc-dot-a.on { background:var(--green); box-shadow:0 0 4px var(--green); }
.sc-stats-a { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px; padding:15px 0; border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
.sc-stat-a { text-align:center; }
.sc-stat-v-a { font-size:16px; font-weight:600; color:var(--text); }
.sc-stat-l-a { font-size:9px; color:var(--text3); text-transform:uppercase; margin-top:4px; letter-spacing:0.04em; }
.sc-actions-a { display:flex; gap:8px; }
.sc-btn-a { flex:1; padding:8px 0; border-radius:12px; font-size:12px; cursor:pointer; text-align:center; border:1px solid var(--border); background:var(--glass2); color:var(--text2); transition:all 0.2s; }
.sc-btn-a.danger { color:var(--red); border-color:rgba(224,112,112,0.2); }
.sc-btn-a:hover:not(.danger) { color:var(--text); border-color:var(--text3); }
.sc-btn-a.danger:hover { background:var(--red-dim); }

.prod-mgmt-grid-a { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.pm-card-a { background:var(--glass); border:1px solid var(--border); border-radius:14px; overflow:hidden; transition:all 0.3s; }
.pm-card-a:hover { border-color:var(--teal-dim); transform:translateY(-2px); }
.pm-img-a { height:120px; background:rgba(255,255,255,0.02); display:flex; align-items:center; justify-content:center; border-bottom:1px solid var(--border); position:relative; }
.pm-body-a { padding:15px; }
.pm-name-a { font-size:13px; font-weight:600; color:var(--text); margin-bottom:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.pm-row-a { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.pm-price-a { font-family:'Playfair Display',serif; font-size:16px; color:var(--text); }
.pm-stock-a { font-size:10px; padding:2px 8px; border-radius:8px; }
.pm-stock-a.ok { background:var(--green-dim); color:var(--green); }
.pm-stock-a.low { background:var(--amber-dim); color:var(--amber); }

.set-card-a { background:var(--glass); border:1px solid var(--border); border-radius:14px; padding:24px; max-width:600px; }
.set-row-a { display:flex; align-items:center; justify-content:space-between; padding:16px 0; border-bottom:1px solid var(--border); }
.set-row-a:last-child { border-bottom:none; }
.set-info-a { flex:1; }
.set-title-a { font-size:14px; font-weight:600; color:var(--text); margin-bottom:4px; }
.set-desc-a { font-size:12px; color:var(--text3); }
.set-tog-a { width:40px; height:22px; border-radius:12px; background:var(--glass2); border:1px solid var(--border); position:relative; cursor:pointer; transition:all 0.3s; }
.set-tog-a.on { background:var(--teal-dim); border-color:var(--teal-glow); }
.set-tog-thumb-a { position:absolute; top:2px; left:2px; width:16px; height:16px; border-radius:50%; background:var(--text3); transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.set-tog-a.on .set-tog-thumb-a { transform:translateX(18px); background:var(--teal); box-shadow:0 0 8px var(--teal-glow); }
</style>

<div class="admin-page">
  <!-- NAVBAR -->
  <div class="navbar-a">
    <div style="display:flex;align-items:center;gap:12px;">
      <div class="logo-a"><div class="logo-dot-a"></div>Nexus</div>
      <div class="badge-a">Admin</div>
    </div>
    <div class="nav-r-a">
      <div class="nav-notif-a" style="position:relative; width:34px; height:34px; background:var(--glass); border:1px solid var(--border); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5c-2.2 0-4 1.8-4 4V9l-1 1.5h10l-1-1.5V5.5c0-2.2-1.8-4-4-4Z" stroke="var(--text2)" stroke-width="1.1"/><path d="M6 12c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5" stroke="var(--text2)" stroke-width="1.1"/></svg>
        <div style="position:absolute; top:-1px; right:-1px; width:8px; height:8px; border-radius:50%; background:var(--red); border:1.5px solid #080808;"></div>
      </div>
    </div>
  </div>

  <div class="body-a">
    <!-- SIDEBAR -->
    <div class="sidebar-a">
      <div class="sg-label-a">Overview</div>
      <div class="sitem-a" [class.active]="tab === 'dashboard'" (click)="tab = 'dashboard'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.6"/><rect x="7" y="1" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.4"/><rect x="1" y="7" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.4"/><rect x="7" y="7" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.3"/></svg>Dashboard</div>
      </div>
      <div class="sitem-a" [class.active]="tab === 'analytics'" (click)="tab = 'analytics'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 10L4 6l3 2 5-6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>Analytics</div>
      </div>

      <div class="sg-label-a">Management</div>
      <div class="sitem-a" [class.active]="tab === 'stores'" (click)="tab = 'stores'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 5.5h10v6a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-6Z" stroke="currentColor" stroke-width="1.1"/><path d="M.5 3l.8-1.5h10.4L12.5 3a2 2 0 0 1-2 2.5h-8A2 2 0 0 1 .5 3Z" stroke="currentColor" stroke-width="1.1"/></svg>Stores</div>
        <div class="sitem-badge-a green">{{stores.length}}</div>
      </div>
      <div class="sitem-a" [class.active]="tab === 'users'" (click)="tab = 'users'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.5" stroke="currentColor" stroke-width="1.1"/><path d="M1.5 11.5c0-2.7 2-4 5-4s5 1.3 5 4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Users</div>
        <div class="sitem-badge-a">{{users.length}}</div>
      </div>
      <div class="sitem-a" [class.active]="tab === 'products'" (click)="tab = 'products'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L1 4v5l5.5 3L12 9V4L6.5 1Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>Products</div>
      </div>
      <div class="sitem-a" [class.active]="tab === 'orders'" (click)="tab = 'orders'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2h1.5l2 7h6l1.5-4.5H4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="11" r="1" fill="currentColor"/><circle cx="10" cy="11" r="1" fill="currentColor"/></svg>Orders</div>
      </div>

      <div class="sitem-a" [class.active]="tab === 'categories'" (click)="tab = 'categories'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2h4v4H2zM7 2h4v4H7zM2 7h4v4H2zM7 7h4v4H7z" stroke="currentColor" stroke-width="1.1"/></svg>Categories</div>
      </div>

      <div class="sitem-a" [class.active]="tab === 'comparison'" (click)="tab = 'comparison'; loadStoreComparison()">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 11V6h2.5v5H1zM5.25 11V3h2.5v8h-2.5zM9.5 11V1H12v10H9.5z" stroke="currentColor" stroke-width="1.1"/></svg>Store Comparison</div>
      </div>

      <div class="sg-label-a">System</div>
      <div class="sitem-a" [class.active]="tab === 'auditlogs'" (click)="tab = 'auditlogs'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 2h7v9H3z" stroke="currentColor" stroke-width="1.1"/><path d="M5 5h3M5 7h2" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>Audit Logs</div>
      </div>
      <div class="sitem-a" [class.active]="tab === 'settings'" (click)="tab = 'settings'">
        <div class="sitem-l-a"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" stroke-width="1.1"/><path d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12M2.6 2.6l.85.85M9.55 9.55l.85.85M2.6 10.4l.85-.85M9.55 3.45l.85-.85" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Config</div>
      </div>

      <div class="sidebar-foot-a">
        <div class="s-user-a" (click)="logout()">
          <div class="nav-av-a" style="flex-shrink:0;">{{auth.currentUserValue?.fullName?.charAt(0)}}</div>
          <div style="min-width:0;">
            <div class="su-name-a" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{auth.currentUserValue?.fullName}}</div>
            <div class="su-role-a">Admin · Logout</div>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="main-a">
      <div *ngIf="isLoading" style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(8,8,8,0.7); z-index:10; backdrop-filter:blur(4px);">
        <div class="set-spin" style="font-size:32px; color:var(--teal);">◌</div>
        <div style="margin-top:12px; font-size:10px; letter-spacing:0.12em; color:var(--teal);">SYNCHRONIZING DATA...</div>
      </div>

      <!-- DASHBOARD PANEL -->
      <div class="panel-a" [class.active]="tab === 'dashboard'">
        <div class="top-bar-a">
          <div><div class="page-title-a">Dashboard</div><div class="page-sub-a">Friday, 17 April · Platform overview</div></div>
          <div class="top-actions-a">
            <button class="tbtn-a tbtn-ghost-a">Export Report</button>
            <button class="tbtn-a tbtn-primary-a">+ Add Store</button>
          </div>
        </div>

        <div class="kpi-row-a">
          <div class="kpi-a"><div class="kpi-label-a">Platform Revenue</div><div class="kpi-val-a">{{stats.totalRevenue | currency}}</div><div class="kpi-delta-a up-a">↑ {{stats.revenueGrowth}}% this month</div></div>
          <div class="kpi-a"><div class="kpi-label-a">Total Orders</div><div class="kpi-val-a">{{stats.totalOrders || 0}}</div><div class="kpi-delta-a up-a">↑ Active</div></div>
          <div class="kpi-a"><div class="kpi-label-a">Active Stores</div><div class="kpi-val-a">{{stats.totalStores || 0}}</div><div class="kpi-delta-a up-a">↑ Online</div></div>
          <div class="kpi-a"><div class="kpi-label-a">Total Users</div><div class="kpi-val-a">{{stats.totalUsers || 0}}</div><div class="kpi-delta-a up-a">↑ {{stats.activeSessions}} live sessions</div></div>
        </div>

        <div class="chart-row-a">
          <div class="gcard-a">
            <div class="gc-head-a"><div class="gc-title-a">Revenue by Month</div><div class="gc-link-a">Full report →</div></div>
            <div class="gc-body-a" style="height:260px;"><canvas #adminRevenueChart></canvas></div>
          </div>
          <div class="gcard-a">
            <div class="gc-head-a"><div class="gc-title-a">Revenue Split</div></div>
            <div class="gc-body-a" style="height:260px;"><canvas #adminCategoryChart></canvas></div>
          </div>
        </div>

        <div class="table-card-a">
          <div class="gc-head-a"><div class="gc-title-a">Recent Orders — All Stores</div><div class="gc-link-a">View all →</div></div>
          <table class="tbl-a">
            <thead><tr><th>Order</th><th>Customer</th><th>Store</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              <tr *ngFor="let o of orders.slice(0,5)">
                <td class="td-mono-a">#{{o.orderId}}</td>
                <td class="td-name-a">{{o.user?.fullName || 'N/A'}}</td>
                <td>{{o.items?.length || 0}} items</td>
                <td>{{o.totalAmount | currency}}</td>
                <td><span class="spill-a" [class.sp-green-a]="o.status==='DELIVERED'" [class.sp-blue-a]="o.status==='SHIPPED' || o.status==='PROCESSING'" [class.sp-amber-a]="o.status==='PENDING'" [class.sp-red-a]="o.status==='CANCELLED'">● {{o.status}}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ANALYTICS PANEL -->
      <div class="panel-a" [class.active]="tab === 'analytics'">
        <div class="top-bar-a"><div><div class="page-title-a">Analytics</div><div class="page-sub-a">Deep platform insights.</div></div></div>
        <div class="kpi-row-a">
          <div class="kpi-a"><div class="kpi-label-a">Conversion Rate</div><div class="kpi-val-a">3.2%</div><div class="kpi-delta-a up-a">↑ 0.4%</div></div>
          <div class="kpi-a"><div class="kpi-label-a">Avg Order Value</div><div class="kpi-val-a">$68.5</div><div class="kpi-delta-a up-a">↑ 12%</div></div>
          <div class="kpi-a"><div class="kpi-label-a">Return Rate</div><div class="kpi-val-a">4.8%</div><div class="kpi-delta-a dn-a">↑ 0.2%</div></div>
          <div class="kpi-a"><div class="kpi-label-a">Active Sessions</div><div class="kpi-val-a">847</div><div class="kpi-delta-a up-a">Live</div></div>
        </div>
        <div class="gcard-a">
          <div class="gc-head-a"><div class="gc-title-a">Traffic by Store</div></div>
          <div class="gc-body-a">
             <div style="display:flex; flex-direction:column; gap:16px;">
                <div *ngFor="let s of stores.slice(0,4)" style="display:flex; align-items:center; gap:12px;">
                  <span style="font-size:12px; color:var(--text2); width:120px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{s.name}}</span>
                  <div style="flex:1; height:4px; background:rgba(255,255,255,0.05); border-radius:4px; overflow:hidden;">
                    <div [style.width.%]="s.rating * 20" style="height:100%; background:var(--teal); border-radius:4px;"></div>
                  </div>
                  <span style="font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--text3); width:30px;">{{(s.rating*20).toFixed(0)}}%</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <!-- STORES PANEL -->
      <div class="panel-a" [class.active]="tab === 'stores'">
        <div class="top-bar-a">
          <div><div class="page-title-a">Store Management</div><div class="page-sub-a">Approve, open or close stores.</div></div>
          <div class="top-actions-a"><button class="tbtn-a tbtn-primary-a">+ New Store</button></div>
        </div>
        <div class="store-grid-a">
          <div class="store-card-a" *ngFor="let s of stores">
            <div class="sc-top-a">
              <div><div class="sc-name-a">{{s.name}}</div><div class="sc-owner-a">Owner: {{s.ownerName}}</div></div>
              <div class="sc-status-a" [class.open]="s.status === 'OPEN'" [class.closed]="s.status !== 'OPEN'">
                <div class="sc-dot-a" [class.on]="s.status === 'OPEN'"></div>{{s.status}}
              </div>
            </div>
            <div class="sc-stats-a">
              <div class="sc-stat-a"><div class="sc-stat-v-a">{{s.totalRevenue | currency}}</div><div class="sc-stat-l-a">Revenue</div></div>
              <div class="sc-stat-a"><div class="sc-stat-v-a">{{s.orderCount}}</div><div class="sc-stat-l-a">Orders</div></div>
              <div class="sc-stat-a"><div class="sc-stat-v-a">{{s.rating}}★</div><div class="sc-stat-l-a">Rating</div></div>
            </div>
            <div class="sc-actions-a">
              <button class="sc-btn-a">View</button>
              <button class="sc-btn-a danger">Action</button>
            </div>
          </div>
        </div>
      </div>

      <!-- CROSS-STORE COMPARISON PANEL -->
      <div class="panel-a" [class.active]="tab === 'comparison'">
        <div class="top-bar-a">
          <div><div class="page-title-a">Cross-Store Comparison</div><div class="page-sub-a">Compare stores by revenue, orders, rating & avg. order value.</div></div>
        </div>
        <div *ngIf="storeComparison.length === 0" style="text-align:center;padding:48px;color:var(--text3);font-size:13px;">Loading comparison data...</div>
        <div *ngIf="storeComparison.length > 0">
          <div style="margin-bottom:20px;">
            <canvas #storeComparisonChart style="width:100%;max-height:320px;"></canvas>
          </div>
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <thead>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);text-align:left;">
                  <th style="padding:10px 12px;color:var(--text3);font-weight:500;">#</th>
                  <th style="padding:10px 12px;color:var(--text3);font-weight:500;">Store</th>
                  <th style="padding:10px 12px;color:var(--text3);font-weight:500;">Owner</th>
                  <th style="padding:10px 12px;color:var(--text3);font-weight:500;text-align:right;">Revenue</th>
                  <th style="padding:10px 12px;color:var(--text3);font-weight:500;text-align:right;">Orders</th>
                  <th style="padding:10px 12px;color:var(--text3);font-weight:500;text-align:right;">Avg. Order</th>
                  <th style="padding:10px 12px;color:var(--text3);font-weight:500;text-align:right;">Rating</th>
                  <th style="padding:10px 12px;color:var(--text3);font-weight:500;">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of storeComparison; let i = index" style="border-bottom:1px solid rgba(255,255,255,0.03);">
                  <td style="padding:10px 12px;color:var(--text3);">{{i + 1}}</td>
                  <td style="padding:10px 12px;font-weight:500;">{{s.name}}</td>
                  <td style="padding:10px 12px;color:var(--text3);">{{s.owner}}</td>
                  <td style="padding:10px 12px;text-align:right;color:#3ECFB2;font-weight:500;">{{s.revenue | currency}}</td>
                  <td style="padding:10px 12px;text-align:right;">{{s.orders}}</td>
                  <td style="padding:10px 12px;text-align:right;">{{s.avgOrderValue | currency}}</td>
                  <td style="padding:10px 12px;text-align:right;">{{s.rating}} ★</td>
                  <td style="padding:10px 12px;">
                    <span style="padding:2px 8px;border-radius:4px;font-size:10px;" [style.background]="s.status === 'OPEN' ? 'rgba(62,207,178,0.12)' : 'rgba(224,112,112,0.12)'" [style.color]="s.status === 'OPEN' ? '#3ECFB2' : '#E07070'">{{s.status}}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- USERS PANEL -->
      <div class="panel-a" [class.active]="tab === 'users'">
        <div class="top-bar-a">
          <div><div class="page-title-a">User Management</div><div class="page-sub-a">View, suspend or ban users.</div></div>
          <div class="top-actions-a"><button class="tbtn-a tbtn-primary-a">+ Add User</button></div>
        </div>
        <div class="table-card-a">
          <table class="tbl-a">
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let u of users">
                <td class="td-name-a">{{u.fullName}}</td>
                <td>{{u.email}}</td>
                <td><span class="spill-a sp-blue-a">{{u.role}}</span></td>
                <td><span class="spill-a sp-green-a">Active</span></td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button class="sc-btn-a" style="padding:4px 10px; font-size:10px;">Edit</button>
                    <button class="sc-btn-a danger" style="padding:4px 10px; font-size:10px;" (click)="banUser(u)">Ban</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PRODUCTS PANEL -->
      <div class="panel-a" [class.active]="tab === 'products'">
        <div class="top-bar-a">
          <div><div class="page-title-a">Product Catalog</div><div class="page-sub-a">Manage all store products.</div></div>
          <div class="top-actions-a"><button class="tbtn-a tbtn-primary-a">+ Add Product</button></div>
        </div>
        <div class="prod-mgmt-grid-a">
          <div class="pm-card-a" *ngFor="let p of pagedProducts.slice(0,9)">
            <div class="pm-img-a">
              <img *ngIf="p.imageUrl" [src]="p.imageUrl" style="max-height:80px;"/>
              <svg *ngIf="!p.imageUrl" width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="4" y="9" width="32" height="20" rx="3" stroke="var(--teal)" stroke-width="1.1" opacity="0.3"/></svg>
            </div>
            <div class="pm-body-a">
              <div class="pm-name-a">{{p.name}}</div>
              <div class="pm-row-a">
                <div class="pm-price-a">{{p.basePrice | currency}}</div>
                <div class="pm-stock-a ok">In Stock</div>
              </div>
              <div class="sc-actions-a">
                <button class="sc-btn-a">Edit</button>
                <button class="sc-btn-a danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ORDERS PANEL -->
      <div class="panel-a" [class.active]="tab === 'orders'">
        <div class="top-bar-a">
          <div><div class="page-title-a">Order Management</div><div class="page-sub-a">View and manage all platform orders.</div></div>
        </div>
        <div class="table-card-a">
          <table class="tbl-a">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              <tr *ngFor="let o of allOrders">
                <td class="td-mono-a">#ORD-{{o.orderId}}</td>
                <td class="td-name-a">{{o.user?.fullName || 'N/A'}}</td>
                <td>{{o.totalAmount | currency}}</td>
                <td><span class="spill-a" [ngClass]="{'sp-green-a': o.status === 'DELIVERED', 'sp-blue-a': o.status === 'PROCESSING' || o.status === 'SHIPPED', 'sp-amber-a': o.status === 'PENDING'}">● {{o.status}}</span></td>
                <td>{{o.orderDate | date:'short'}}</td>
              </tr>
              <tr *ngIf="allOrders.length === 0">
                <td colspan="5" style="text-align:center;color:var(--text3);padding:32px;">No orders yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CATEGORIES PANEL -->
      <div class="panel-a" [class.active]="tab === 'categories'">
        <div class="top-bar-a">
          <div><div class="page-title-a">Category Management</div><div class="page-sub-a">Manage product taxonomy.</div></div>
          <div class="top-actions-a"><button class="tbtn-a tbtn-primary-a" (click)="addCategory()">+ Add Category</button></div>
        </div>
        <div class="table-card-a">
          <table class="tbl-a">
            <thead><tr><th>Category</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of categories">
                <td class="td-name-a">{{c.name}}</td>
                <td>{{c.description || '—'}}</td>
                <td><span class="spill-a" [class.sp-green-a]="c.active" [class.sp-amber-a]="!c.active">{{c.active ? 'Active' : 'Inactive'}}</span></td>
                <td>
                  <div style="display:flex;gap:6px;">
                    <button class="sc-btn-a danger" style="padding:4px 10px;font-size:10px;" (click)="deleteCategory(c)">Delete</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="categories.length === 0"><td colspan="4" style="text-align:center;color:var(--text3);padding:32px;">No categories. Add one to get started.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- AUDIT LOGS PANEL -->
      <div class="panel-a" [class.active]="tab === 'auditlogs'">
        <div class="top-bar-a"><div><div class="page-title-a">Audit Logs</div><div class="page-sub-a">Platform activity monitoring.</div></div></div>
        <div class="table-card-a">
          <table class="tbl-a">
            <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Details</th></tr></thead>
            <tbody>
              <tr *ngFor="let log of auditLogs">
                <td style="font-family:'JetBrains Mono',monospace;font-size:10px;">{{log.time}}</td>
                <td class="td-name-a">{{log.user}}</td>
                <td><span class="spill-a" [class.sp-green-a]="log.type==='success'" [class.sp-blue-a]="log.type==='info'" [class.sp-amber-a]="log.type==='warning'">{{log.action}}</span></td>
                <td style="color:var(--text3);font-size:11px;">{{log.detail}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CONFIG PANEL -->
      <div class="panel-a" [class.active]="tab === 'settings'">
        <div class="top-bar-a"><div><div class="page-title-a">System Config</div><div class="page-sub-a">Manage platform behavior.</div></div></div>
        <div class="set-card-a">
          <div class="set-row-a">
            <div class="set-info-a"><div class="set-title-a">Maintenance Mode</div><div class="set-desc-a">Disable public store access</div></div>
            <div class="set-tog-a" [class.on]="sysSettings.maintenance" (click)="sysSettings.maintenance = !sysSettings.maintenance"><div class="set-tog-thumb-a"></div></div>
          </div>
          <div class="set-row-a">
            <div class="set-info-a"><div class="set-title-a">AI Assistant</div><div class="set-desc-a">Enable Text2SQL support for customers</div></div>
            <div class="set-tog-a" [class.on]="sysSettings.aiAssistant" (click)="sysSettings.aiAssistant = !sysSettings.aiAssistant"><div class="set-tog-thumb-a"></div></div>
          </div>
          <div class="set-row-a">
            <div class="set-info-a"><div class="set-title-a">New Registrations</div><div class="set-desc-a">Allow visitors to create new accounts</div></div>
            <div class="set-tog-a" [class.on]="sysSettings.registrations" (click)="sysSettings.registrations = !sysSettings.registrations"><div class="set-tog-thumb-a"></div></div>
          </div>
          <div style="margin-top:24px;">
            <button class="tbtn-a tbtn-primary-a" style="width:100%;" (click)="saveSettings($event)">Save All Changes</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
  `,
})
export class AdminComponent implements OnInit, AfterViewInit {
  tab = 'dashboard';
  isLoading = true;
  auth = inject(AuthService);
  productService = inject(ProductService);
  storeService = inject(StoreService);
  adminService = inject(AdminService);
  categoryService = inject(CategoryService);
  toast = inject(ToastService);
  router = inject(Router);

  @ViewChild('adminRevenueChart') adminRevenueCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('adminCategoryChart') adminCategoryCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('storeComparisonChart') storeComparisonCanvas!: ElementRef<HTMLCanvasElement>;
  private revChart: Chart | null = null;
  private catChart: Chart | null = null;
  private compChart: Chart | null = null;

  storeComparison: any[] = [];
  categories: any[] = [];
  auditLogs: any[] = [];

  stores: any[] = [];
  users: any[] = [];
  orders: any[] = [];
  allOrders: any[] = [];
  pagedProducts: any[] = [];
  stats: any = {};

  sysSettings = {
    maintenance: false,
    registrations: true,
    aiAssistant: true
  };

  ngOnInit() {
    this.refreshData();
    this.categoryService.getAll().subscribe(res => this.categories = res);
    this.loadAuditLogs();
    this.logAudit('Login', 'success', 'Admin authenticated via JWT');
  }

  loadAuditLogs() {
    this.adminService.getAuditLogs().subscribe({
      next: (logs) => this.auditLogs = logs.map(l => ({
        time: l.createdAt?.replace('T', ' ')?.slice(0, 19) || '',
        user: l.username || 'System',
        action: l.action,
        type: l.type,
        detail: l.detail
      })),
      error: () => { }
    });
  }

  logAudit(action: string, type: string, detail: string) {
    this.adminService.createAuditLog(action, type, detail).subscribe({
      next: () => this.loadAuditLogs(),
      error: () => { }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.buildAdminCharts(), 800);
  }

  private buildAdminCharts() {
    if (this.adminRevenueCanvas?.nativeElement) {
      if (this.revChart) this.revChart.destroy();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const revenueByMonth = new Array(12).fill(0);
      this.allOrders.forEach((o: any) => {
        const d = new Date(o.orderDate);
        if (!isNaN(d.getTime())) revenueByMonth[d.getMonth()] += o.totalAmount || 0;
      });
      this.revChart = new Chart(this.adminRevenueCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Revenue ($)',
            data: revenueByMonth,
            borderColor: '#3ECFB2',
            backgroundColor: 'rgba(62,207,178,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#3ECFB2',
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#7A918D' }, grid: { color: 'rgba(255,255,255,0.04)' } },
            y: { ticks: { color: '#7A918D' }, grid: { color: 'rgba(255,255,255,0.04)' } }
          }
        }
      });
    }

    if (this.adminCategoryCanvas?.nativeElement) {
      if (this.catChart) this.catChart.destroy();
      const catMap: Record<string, number> = {};
      this.pagedProducts.forEach((p: any) => { catMap[p.category || 'Other'] = (catMap[p.category || 'Other'] || 0) + 1; });
      const labels = Object.keys(catMap);
      const data = Object.values(catMap);
      const palette = ['#3ECFB2', '#6BA8C8', '#E8A94A', '#E07070', '#A78BFA', '#34D399', '#F472B6'];
      this.catChart = new Chart(this.adminCategoryCanvas.nativeElement, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: palette.slice(0, labels.length), borderWidth: 0 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#7A918D', padding: 12, font: { size: 10 } } } }
        }
      });
    }
  }

  refreshData() {
    this.isLoading = true;
    import('rxjs').then(({ forkJoin }) => {
      forkJoin([
        this.productService.getProducts(),
        this.storeService.getStores(),
        this.adminService.getUsers(),
        this.adminService.getOrders(),
        this.adminService.getStats()
      ]).subscribe({
        next: (results: any) => {
          this.pagedProducts = results[0];
          this.stores = results[1];
          this.users = results[2];
          this.allOrders = results[3];
          this.orders = results[3].slice(0, 10);
          this.stats = results[4];
          this.isLoading = false;
          setTimeout(() => this.buildAdminCharts(), 200);
        },
        error: () => {
          this.toast.show('Error fetching data', 'error');
          this.isLoading = false;
        }
      });
    });
  }

  loadStoreComparison() {
    this.adminService.getStoreComparison().subscribe({
      next: (data) => {
        this.storeComparison = data;
        setTimeout(() => this.buildComparisonChart(), 300);
      },
      error: () => this.toast.show('Failed to load comparison data', 'error')
    });
  }

  private buildComparisonChart() {
    if (!this.storeComparisonCanvas?.nativeElement) return;
    if (this.compChart) this.compChart.destroy();
    const labels = this.storeComparison.map(s => s.name);
    this.compChart = new Chart(this.storeComparisonCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue ($)',
            data: this.storeComparison.map(s => s.revenue),
            backgroundColor: 'rgba(62,207,178,0.7)',
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            label: 'Orders',
            data: this.storeComparison.map(s => s.orders),
            backgroundColor: 'rgba(107,168,200,0.7)',
            borderRadius: 4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { color: '#7A918D', font: { size: 10 }, padding: 16 } }
        },
        scales: {
          x: { ticks: { color: '#7A918D' }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { position: 'left', ticks: { color: '#3ECFB2' }, grid: { color: 'rgba(255,255,255,0.04)' }, title: { display: true, text: 'Revenue ($)', color: '#3ECFB2', font: { size: 10 } } },
          y1: { position: 'right', ticks: { color: '#6BA8C8' }, grid: { display: false }, title: { display: true, text: 'Orders', color: '#6BA8C8', font: { size: 10 } } }
        }
      }
    });
  }

  saveSettings(event: any) {
    const btn = event.currentTarget;
    const oldHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Saving...';
    setTimeout(() => {
      this.toast.show('Settings updated');
      btn.innerHTML = oldHtml;
      btn.disabled = false;
    }, 1000);
  }

  banUser(u: any) {
    if (!confirm(`Ban ${u.fullName}?`)) return;
    this.adminService.banUser(u.userId).subscribe(() => {
      this.toast.show('User banned');
      this.logAudit('Ban User', 'warning', `Banned ${u.fullName}`);
      this.refreshData();
    });
  }

  addCategory() {
    const name = prompt('Category name:');
    if (!name) return;
    this.categoryService.create({ name, description: '', active: true }).subscribe({
      next: (c) => {
        this.categories.push(c);
        this.toast.show('Category created');
        this.logAudit('Create Category', 'success', name);
      },
      error: (e) => this.toast.show(e.error?.message || 'Failed to create category', 'error')
    });
  }

  deleteCategory(c: any) {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    this.categoryService.delete(c.categoryId).subscribe({
      next: () => {
        this.categories = this.categories.filter(x => x.categoryId !== c.categoryId);
        this.toast.show('Category deleted');
        this.logAudit('Delete Category', 'warning', c.name);
      },
      error: () => this.toast.show('Failed to delete category', 'error')
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-frame">
      <div class="navbar-nexus">
        <div style="display:flex;align-items:center;gap:15px;">
          <div class="logo-admin" routerLink="/consumer"><div class="logo-dot-admin"></div>Nexus Settings</div>
        </div>
        <div class="nav-r-nexus">
          <div class="mag-pill" style="font-size:11px; padding:6px 14px; border-radius:12px;" (click)="goBack()">← Exit Settings</div>
        </div>
      </div>

      <div class="body-frame">
        <div class="sidebar-nexus" style="width:240px; min-width:240px; padding:20px 16px;">
          <div class="sg-label-admin">Account</div>
          <div class="sitem-nexus" [class.active]="tab === 'personal'" (click)="tab = 'personal'"><div class="sitem-l-nexus"><svg width="13" height="13" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="3" stroke="currentColor" stroke-width="1.1"/><path d="M2 13c0-3 2.5-4.5 5.5-4.5S13 10 13 13" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Personal Info</div></div>
          <div class="sitem-nexus" [class.active]="tab === 'password'" (click)="tab = 'password'"><div class="sitem-l-nexus"><svg width="13" height="13" viewBox="0 0 15 15" fill="none"><rect x="2.5" y="6" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.1"/><path d="M5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Security</div></div>
          
          <div class="sg-label-admin">Shopping</div>
          <div class="sitem-nexus" [class.active]="tab === 'addresses'" (click)="tab = 'addresses'"><div class="sitem-l-nexus"><svg width="13" height="13" viewBox="0 0 15 15" fill="none"><path d="M7.5 2C5.3 2 3.5 3.8 3.5 6c0 3.5 4 7 4 7s4-3.5 4-7c0-2.2-1.8-4-4-4Z" stroke="currentColor" stroke-width="1.1"/></svg>Addresses</div></div>
          
          <div class="sidebar-foot-nexus">
            <div class="s-user-nexus" style="opacity:0.6;">
              <div><div class="su-name-nexus">{{editUser.fullName}}</div><div class="su-role-nexus">{{editUser.role?.toLowerCase()}}</div></div>
            </div>
          </div>
        </div>

        <div class="main-nexus">
          <div class="panel-nexus" [class.active]="tab === 'personal'" *ngIf="tab === 'personal'">
            <div class="top-bar-nexus">
              <div><div class="page-title-nexus">Personal Details</div><div class="page-sub-nexus">Manage your identification and contact info.</div></div>
              <button class="sc-btn-nexus primary" (click)="saveProfile($event)">Save Changes</button>
            </div>
            
            <div class="card-nexus" style="margin-top:20px; padding:24px;">
              <div style="display:flex; align-items:center; gap:20px; margin-bottom:32px;">
                <div class="nav-av-nexus" style="width:64px; height:64px; font-size:24px;">{{editUser.fullName?.charAt(0)}}</div>
                <div>
                  <div style="font-size:18px; font-weight:600; color:var(--text);">{{editUser.fullName}}</div>
                  <div style="font-size:13px; color:var(--text3); margin-top:2px;">{{editUser.email}}</div>
                </div>
              </div>

              <div class="grid-2-nexus" style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                <div class="field-nexus"><label>Full Name</label><input [(ngModel)]="editUser.fullName" placeholder="Your full name"/></div>
                <div class="field-nexus"><label>Email Address</label><input [(ngModel)]="editUser.email" type="email" placeholder="email@example.com"/></div>
                <div class="field-nexus"><label>Phone Number</label><input [(ngModel)]="editUser.phone" placeholder="+90 5XX XXX XX XX"/></div>
                <div class="field-nexus">
                  <label>Role</label>
                  <input [value]="editUser.role" disabled style="opacity:0.5; cursor:not-allowed;"/>
                </div>
              </div>

              <div style="height:1px;background:var(--border);margin:24px 0;"></div>
              <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:16px;font-weight:600;">Profile Details</div>
              <div class="grid-2-nexus" style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                <div class="field-nexus"><label>Gender</label><input [(ngModel)]="profile.gender" placeholder="e.g. Male, Female, Other"/></div>
                <div class="field-nexus"><label>Age</label><input [(ngModel)]="profile.age" type="number" placeholder="25"/></div>
                <div class="field-nexus"><label>City</label><input [(ngModel)]="profile.city" placeholder="e.g. Istanbul"/></div>
                <div class="field-nexus"><label>Country</label><input [(ngModel)]="profile.country" placeholder="e.g. Turkey"/></div>
                <div class="field-nexus">
                  <label>Membership</label>
                  <input [value]="profile.membershipType" disabled style="opacity:0.5; cursor:not-allowed;"/>
                </div>
                <div class="field-nexus">
                  <label>Total Spend</label>
                  <input [value]="((profile.totalSpend || 0) | currency)" disabled style="opacity:0.5; cursor:not-allowed;"/>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-nexus" [class.active]="tab === 'password'" *ngIf="tab === 'password'">
             <div class="top-bar-nexus"><div><div class="page-title-nexus">Security</div><div class="page-sub-nexus">Change your access credentials.</div></div></div>
             <div class="card-nexus" style="max-width:400px; padding:24px; margin-top:20px;">
                <div class="field-nexus" style="margin-bottom:15px;"><label>Current Password</label><input type="password" placeholder="••••••••" [(ngModel)]="currentPassword"/></div>
                <div class="field-nexus" style="margin-bottom:15px;"><label>New Password</label><input type="password" placeholder="••••••••" [(ngModel)]="newPassword" (input)="updatePwStrength($event)"/></div>
                <div style="display:flex; gap:4px; margin-bottom:15px;">
                  <div *ngFor="let i of [1,2,3,4]" [style.background]="pwS >= i ? pwC : 'var(--glass)'" style="flex:1; height:3px; border-radius:2px;"></div>
                </div>
                <p *ngIf="pwError" style="color:var(--red);font-size:12px;margin-bottom:10px;">{{pwError}}</p>
                <p *ngIf="pwSuccess" style="color:var(--green);font-size:12px;margin-bottom:10px;">{{pwSuccess}}</p>
                <button class="sc-btn-nexus primary" style="width:100%;" (click)="changePassword()">Update Password</button>
             </div>
          </div>

          <div class="panel-nexus" [class.active]="tab === 'addresses'" *ngIf="tab === 'addresses'">
             <div class="top-bar-nexus"><div><div class="page-title-nexus">Addresses</div><div class="page-sub-nexus">Manage your shipping locations.</div></div></div>
             <div class="grid-2-nexus" style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:20px;">
                <div class="card-nexus" style="padding:20px; border-color:var(--teal-glow);">
                   <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                      <div style="font-weight:600; font-size:14px;">Home</div>
                      <div class="spill-nexus sp-green">Default</div>
                   </div>
                   <div style="font-size:12px; color:var(--text2); margin-top:10px; line-height:1.5;">Halaskargazi Cad. No:42, Şişli/İstanbul</div>
                </div>
                <div class="table-card-nexus" style="padding:20px;">
                  <div class="gc-title-nexus" style="margin-bottom:15px;">Sales by Category</div>
                  <div style="display:flex; flex-direction:column; gap:12px;">
                    <div *ngFor="let c of breakdown.categories" style="display:flex; align-items:center; justify-content:space-between;">
                      <div style="font-size:12px; color:var(--text2);">{{c.name}}</div>
                      <div style="font-size:12px; color:var(--text); font-weight:500;">{{c.value | currency}}</div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-frame { height: 100vh; display:flex; flex-direction:column; background:var(--bg); }
    .navbar-nexus { padding:14px 24px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border); background:rgba(8,8,8,0.9); backdrop-filter:blur(20px); z-index:100; }
    .body-frame { display:flex; flex:1; overflow:hidden; }
    .sidebar-nexus { border-right:1px solid var(--border); background:rgba(8,8,8,0.2); }
    .main-nexus { flex:1; overflow-y:auto; padding:32px; }
    .panel-nexus { display:none; }
    .panel-nexus.active { display:block; animation: fadeUp 0.4s ease; }
    .card-nexus { background:var(--glass); border:1px solid var(--border); border-radius:16px; backdrop-filter:blur(20px); }
    .field-nexus label { display:block; font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px; font-weight:600; }
    .field-nexus input { width:100%; background:var(--glass2); border:1px solid var(--border); border-radius:10px; padding:10px 14px; color:var(--text); font-size:13px; outline:none; transition:0.2s; }
    .field-nexus input:focus { border-color:var(--teal); background:var(--glass); }
    @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  `]
})
export class SettingsComponent implements OnInit {
  tab = 'personal';
  editUser: any = {};
  profile: any = { gender: '', age: null, city: '', country: '', membershipType: 'BASIC' };
  pwS = 0; pwC = '';
  breakdown: any = { categories: [] };
  currentPassword = '';
  newPassword = '';
  pwError = '';
  pwSuccess = '';

  auth = inject(AuthService);
  adminService = inject(AdminService);
  profileService = inject(CustomerProfileService);
  toast = inject(ToastService);
  router = inject(Router);

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => {
      if (u) {
        this.editUser = { ...u };
        this.profileService.getMyProfile().subscribe({
          next: (p: any) => { if (p) this.profile = { ...this.profile, ...p }; },
          error: () => { }
        });
        if (u.role === 'ADMIN' || u.role === 'MANAGER') {
          this.adminService.getSalesBreakdown().subscribe(res => {
            this.breakdown = res;
          });
        }
      }
    });
  }

  goBack() {
    const role = this.editUser.role || 'CONSUMER';
    if (role === 'ADMIN') this.router.navigate(['/admin']);
    else if (role === 'MANAGER') this.router.navigate(['/manager']);
    else this.router.navigate(['/consumer']);
  }

  saveProfile(event: any) {
    const btn = event.currentTarget;
    const oldText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="set-spin">◌</span> Saving...';

    this.profileService.save(this.profile).subscribe({
      next: (saved: any) => {
        if (saved) this.profile = { ...this.profile, ...saved };
        this.auth.updateUser(this.editUser);
        this.toast.show('Profile updated successfully!', 'success');
        btn.innerHTML = '✓ Saved';
        setTimeout(() => { btn.innerHTML = oldText; btn.disabled = false; }, 2000);
      },
      error: () => {
        this.auth.updateUser(this.editUser);
        this.toast.show('Profile updated (local only)', 'info');
        btn.innerHTML = oldText; btn.disabled = false;
      }
    });
  }

  changePassword() {
    this.pwError = '';
    this.pwSuccess = '';
    if (!this.currentPassword || !this.newPassword) {
      this.pwError = 'Please fill in both fields.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.pwError = 'New password must be at least 6 characters.';
      return;
    }
    this.auth.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.pwSuccess = 'Password changed successfully!';
        this.currentPassword = '';
        this.newPassword = '';
        this.pwS = 0;
      },
      error: (err: any) => {
        this.pwError = err?.error?.message || 'Failed to change password.';
      }
    });
  }

  updatePwStrength(ev: any) {
    const v = ev.target.value || '';
    this.pwS = 0;
    if (v.length >= 6) this.pwS++;
    if (v.length >= 10) this.pwS++;
    if (/[0-9]/.test(v)) this.pwS++;
    if (/[A-Z]/.test(v)) this.pwS++;
    const colors = ['#E07070', '#E8A94A', '#E8A94A', '#3EC98A'];
    this.pwC = this.pwS > 0 ? colors[this.pwS - 1] : '';
  }
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<style>
.landing-page-full {
  background: #080808;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #E6F0EE;
  min-height: 100vh;
  --teal: #3ECFB2;
  --teal2: #6EDEC8;
  --teal-dim: rgba(62,207,178,0.1);
  --teal-glow: rgba(62,207,178,0.18);
  --text-dim: #6A8A84;
  --text-deep: #344844;
  --border: rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.12);
  --glass: rgba(255,255,255,0.04);
}

.navbar-l {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 32px;
  border-bottom: 1px solid var(--border);
  background: rgba(8,8,8,0.92);
  backdrop-filter: blur(20px);
  position: sticky; top: 0; z-index: 100;
}
.logo-l { font-family: 'Playfair Display', serif; font-style: italic; font-size: 20px; color: #E6F0EE; display: flex; align-items: center; gap: 8px; }
.logo-dot-l { width: 7px; height: 7px; border-radius: 50%; background: var(--teal); box-shadow: 0 0 8px var(--teal-glow); }
.nav-pills-l { display: flex; align-items: center; gap: 3px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 30px; padding: 4px; }
.npill-l { padding: 6px 16px; border-radius: 20px; font-size: 12px; color: var(--text-dim); cursor: pointer; transition: all 0.2s; text-decoration: none; }
.npill-l.active { background: var(--teal-dim); color: var(--teal2); border: 1px solid rgba(62,207,178,0.18); }
.nav-r-l { display: flex; align-items: center; gap: 8px; }
.nbtn-l { padding: 7px 18px; border-radius: 20px; font-size: 12px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; text-decoration: none; transition: all 0.2s; }
.nbtn-ghost-l { background: transparent; border: 1px solid var(--border2); color: var(--text-dim); }
.nbtn-teal-l { background: var(--teal-dim); border: 1px solid rgba(62,207,178,0.2); color: var(--teal2); }
.nbtn-ghost-l:hover { border-color: #E6F0EE; color: #E6F0EE; }
.nbtn-teal-l:hover { background: var(--teal); color: #080808; }

.hero-l {
  min-height: 560px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 80px 40px 60px;
  position: relative;
  overflow: hidden;
}
.hero-glow-1-l { position: absolute; top: -80px; left: 50%; transform: translateX(-50%); width: 600px; height: 400px; background: radial-gradient(ellipse, rgba(62,207,178,0.08) 0%, transparent 65%); pointer-events: none; }
.hero-glow-2-l { position: absolute; bottom: -100px; left: 20%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(62,207,178,0.05) 0%, transparent 65%); pointer-events: none; }

.hero-badge-l {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--teal-dim); border: 1px solid rgba(62,207,178,0.2);
  color: var(--teal2); font-size: 11px; padding: 5px 14px; border-radius: 20px;
  margin-bottom: 28px; letter-spacing: 0.04em;
}
.badge-dot-l { width: 5px; height: 5px; border-radius: 50%; background: var(--teal); animation: pulse-l 2s infinite; }
@keyframes pulse-l { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.hero-title-l {
  font-family: 'Playfair Display', serif;
  font-size: 58px; font-weight: 400;
  color: #E6F0EE; line-height: 1.1;
  letter-spacing: -0.02em; margin-bottom: 10px;
  max-width: 700px;
}
.hero-title-l em { font-style: italic; color: var(--teal2); }

.hero-sub-l {
  font-size: 15px; color: var(--text-dim);
  line-height: 1.7; max-width: 480px;
  margin: 16px auto 36px; font-weight: 300;
}

.hero-cta-l { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 60px; }
.btn-primary-l {
  padding: 12px 28px; border-radius: 24px;
  background: var(--teal); color: #080808;
  font-size: 13px; font-weight: 600; cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all 0.2s; border: none; text-decoration: none;
}
.btn-primary-l:hover { background: var(--teal2); transform: translateY(-2px); }
.btn-secondary-l {
  padding: 12px 28px; border-radius: 24px;
  background: transparent; color: var(--text-dim);
  font-size: 13px; cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  border: 1px solid var(--border2); transition: all 0.2s; text-decoration: none;
}
.btn-secondary-l:hover { color: #E6F0EE; border-color: rgba(255,255,255,0.2); }

.stats-section-l {
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  display: grid; grid-template-columns: repeat(4, 1fr);
}
.stat-item-l { padding: 28px 0; text-align: center; border-right: 1px solid var(--border); }
.stat-item-l:last-child { border-right: none; }
.stat-val-l { font-family: 'Playfair Display', serif; font-size: 32px; color: #E6F0EE; line-height: 1; margin-bottom: 6px; }
.stat-val-l em { font-style: italic; color: var(--teal2); }
.stat-label-l { font-size: 11px; color: var(--text-deep); letter-spacing: 0.08em; text-transform: uppercase; }

.features-section-l { padding: 64px 40px; }
.section-eyebrow-l { font-size: 9.5px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--teal); margin-bottom: 12px; text-align: center; }
.section-title-l { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 400; font-style: italic; color: #E6F0EE; text-align: center; margin-bottom: 48px; line-height: 1.2; max-width: 500px; margin-left: auto; margin-right: auto; }

.features-grid-l { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); }
.feat-card-l { background: #080808; padding: 32px 28px; transition: background 0.2s; }
.feat-card-l:hover { background: rgba(255,255,255,0.02); }
.feat-icon-l { width: 40px; height: 40px; border-radius: 10px; background: var(--teal-dim); border: 1px solid rgba(62,207,178,0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.feat-title-l { font-size: 15px; font-weight: 500; color: #E6F0EE; margin-bottom: 8px; }
.feat-desc-l { font-size: 12.5px; color: var(--text-dim); line-height: 1.7; font-weight: 300; }

.showcase-section-l { padding: 64px 40px; border-top: 1px solid var(--border); }
.showcase-row-l { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.showcase-card-l { background: var(--glass); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; backdrop-filter: blur(12px); transition: border-color 0.2s, transform 0.2s; cursor: pointer; }
.showcase-card-l:hover { border-color: rgba(62,207,178,0.2); transform: translateY(-3px); }
.sc-img-l { aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--border); font-size: 48px; position: relative; }
.sc-glow-l { position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s; }
.showcase-card-l:hover .sc-glow-l { opacity: 1; }
.sc-body-l { padding: 16px 18px; }
.sc-cat-l { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-deep); margin-bottom: 4px; }
.sc-name-l { font-size: 14px; font-weight: 500; color: #E6F0EE; margin-bottom: 10px; }
.sc-bottom-l { display: flex; align-items: center; justify-content: space-between; }
.sc-price-l { font-family: 'Playfair Display', serif; font-size: 18px; color: #E6F0EE; }
.sc-btn-l { font-size: 11px; padding: 5px 14px; border-radius: 20px; background: var(--teal-dim); border: 1px solid rgba(62,207,178,0.2); color: var(--teal2); cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.18s; }
.showcase-card-l:hover .sc-btn-l { background: var(--teal); color: #080808; border-color: var(--teal); }

.cta-section-l { padding: 80px 40px; text-align: center; border-top: 1px solid var(--border); position: relative; overflow: hidden; }
.cta-glow-l { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 500px; height: 300px; background: radial-gradient(ellipse, rgba(62,207,178,0.07) 0%, transparent 65%); pointer-events: none; }
.cta-title-l { font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 400; color: #E6F0EE; line-height: 1.15; margin-bottom: 16px; position: relative; z-index: 1; }
.cta-title-l em { font-style: italic; color: var(--teal2); }
.cta-sub-l { font-size: 14px; color: var(--text-dim); margin-bottom: 36px; font-weight: 300; position: relative; z-index: 1; }
.cta-btns-l { display: flex; align-items: center; gap: 10px; justify-content: center; position: relative; z-index: 1; }

.footer-l { padding: 24px 40px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.footer-logo-l { font-family: 'Playfair Display', serif; font-style: italic; font-size: 16px; color: var(--text-dim); }
.footer-links-l { display: flex; gap: 20px; }
.footer-link-l { font-size: 11px; color: var(--text-deep); cursor: pointer; letter-spacing: 0.03em; }
.footer-link-l:hover { color: var(--text-dim); }
.footer-right-l { font-size: 11px; color: var(--text-deep); font-family: 'JetBrains Mono', monospace; }
</style>

<div class="landing-page-full">
  <!-- NAVBAR -->
  <div class="navbar-l">
    <div class="logo-l"><div class="logo-dot-l"></div>Nexus</div>
    <div class="nav-pills-l">
      <a class="npill-l active" routerLink="/">Home</a>
      <a class="npill-l" routerLink="/consumer">Shop</a>
      <a class="npill-l" href="#">About</a>
      <a class="npill-l" href="#">Contact</a>
    </div>
    <div class="nav-r-l">
      <a class="nbtn-l nbtn-ghost-l" routerLink="/login">Login</a>
      <a class="nbtn-l nbtn-teal-l" routerLink="/login">Sign Up</a>
    </div>
  </div>

  <!-- HERO -->
  <div class="hero-l">
    <div class="hero-glow-1-l"></div>
    <div class="hero-glow-2-l"></div>

    <div class="hero-badge-l">
      <div class="badge-dot-l"></div>
      Premium Tech Commerce
    </div>

    <div class="hero-title-l">
      The future of<br><em>tech shopping</em><br>is here.
    </div>

    <div class="hero-sub-l">
      Discover curated premium technology products. Seamless experience, intelligent recommendations, effortless checkout.
    </div>

    <div class="hero-cta-l">
      <a class="btn-primary-l" routerLink="/consumer">Shop Now →</a>
      <a class="btn-secondary-l" href="#">Learn more</a>
    </div>
  </div>

  <!-- STATS -->
  <div class="stats-section-l">
    <div class="stat-item-l">
      <div class="stat-val-l">50<em>K+</em></div>
      <div class="stat-label-l">Products</div>
    </div>
    <div class="stat-item-l">
      <div class="stat-val-l">2<em>M+</em></div>
      <div class="stat-label-l">Happy Customers</div>
    </div>
    <div class="stat-item-l">
      <div class="stat-val-l">4.9<em>★</em></div>
      <div class="stat-label-l">Avg. Rating</div>
    </div>
    <div class="stat-item-l">
      <div class="stat-val-l">48<em>h</em></div>
      <div class="stat-label-l">Fast Delivery</div>
    </div>
  </div>

  <!-- FEATURES -->
  <div class="features-section-l">
    <div class="section-eyebrow-l">Why Nexus</div>
    <div class="section-title-l">Built for the<br><em>modern buyer</em></div>

    <div class="features-grid-l">
      <div class="feat-card-l">
        <div class="feat-icon-l">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke="#3ECFB2" stroke-width="1.3"/><path d="M6 9l2 2 4-4" stroke="#3ECFB2" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="feat-title-l">Curated Selection</div>
        <div class="feat-desc-l">Every product is hand-picked and verified by our team of tech experts before listing.</div>
      </div>
      <div class="feat-card-l">
        <div class="feat-icon-l">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 6v6l7 4 7-4V6L9 2Z" stroke="#3ECFB2" stroke-width="1.3" stroke-linejoin="round"/><path d="M9 2v10" stroke="#3ECFB2" stroke-width="1.3"/></svg>
        </div>
        <div class="feat-title-l">AI Recommendations</div>
        <div class="feat-desc-l">Our Text2SQL AI assistant helps you find exactly what you need in seconds.</div>
      </div>
      <div class="feat-card-l">
        <div class="feat-icon-l">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9h12M9 3v12" stroke="#3ECFB2" stroke-width="1.3" stroke-linecap="round"/><rect x="2" y="2" width="14" height="14" rx="4" stroke="#3ECFB2" stroke-width="1.3"/></svg>
        </div>
        <div class="feat-title-l">Seamless Checkout</div>
        <div class="feat-desc-l">Multiple payment options, one-click reorder, and real-time shipment tracking.</div>
      </div>
    </div>
  </div>

  <!-- PRODUCT SHOWCASE -->
  <div class="showcase-section-l">
    <div class="section-eyebrow-l">Featured Products</div>
    <div class="section-title-l" style="margin-bottom:32px;">Trending <em>this week</em></div>

    <div class="showcase-row-l">
      <div class="showcase-card-l" routerLink="/consumer">
        <div class="sc-img-l" style="background:rgba(62,207,178,0.04);">
          <div class="sc-glow-l" style="background:radial-gradient(circle,rgba(62,207,178,0.08),transparent 70%)"></div>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="8" y="16" width="48" height="32" rx="4" stroke="#3ECFB2" stroke-width="1.5" opacity="0.6"/><rect x="24" y="48" width="16" height="3" rx="1.5" fill="#3ECFB2" opacity="0.3"/><rect x="12" y="20" width="40" height="24" rx="2" fill="rgba(62,207,178,0.06)"/></svg>
        </div>
        <div class="sc-body-l">
          <div class="sc-cat-l">Electronics</div>
          <div class="sc-name-l">MacBook Pro 14"</div>
          <div class="sc-bottom-l">
            <div class="sc-price-l">$1,299</div>
            <div class="sc-btn-l">Add to cart</div>
          </div>
        </div>
      </div>

      <div class="showcase-card-l" routerLink="/consumer">
        <div class="sc-img-l" style="background:rgba(107,168,200,0.04);">
          <div class="sc-glow-l" style="background:radial-gradient(circle,rgba(107,168,200,0.08),transparent 70%)"></div>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M32 14c-10 0-18 8-18 18s8 18 18 18 18-8 18-18-8-18-18-18Z" stroke="#6BA8C8" stroke-width="1.5" opacity="0.6"/><path d="M22 32c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#6BA8C8" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/><circle cx="32" cy="32" r="4" fill="rgba(107,168,200,0.15)" stroke="#6BA8C8" stroke-width="1.2"/></svg>
        </div>
        <div class="sc-body-l">
          <div class="sc-cat-l">Accessories</div>
          <div class="sc-name-l">AirPods Pro Max</div>
          <div class="sc-bottom-l">
            <div class="sc-price-l">$479</div>
            <div class="sc-btn-l">Add to cart</div>
          </div>
        </div>
      </div>

      <div class="showcase-card-l" routerLink="/consumer">
        <div class="sc-img-l" style="background:rgba(200,160,100,0.04);">
          <div class="sc-glow-l" style="background:radial-gradient(circle,rgba(200,160,100,0.08),transparent 70%)"></div>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="10" y="24" width="44" height="28" rx="4" stroke="#C8A064" stroke-width="1.5" opacity="0.6"/><rect x="16" y="18" width="8" height="6" rx="2" fill="rgba(200,160,100,0.1)" stroke="#C8A064" stroke-width="1.2" opacity="0.5"/><rect x="16" y="30" width="32" height="4" rx="2" fill="rgba(200,160,100,0.1)"/><rect x="16" y="38" width="24" height="4" rx="2" fill="rgba(200,160,100,0.07)"/></svg>
        </div>
        <div class="sc-body-l">
          <div class="sc-cat-l">Peripherals</div>
          <div class="sc-name-l">Keychron Q1 Pro</div>
          <div class="sc-bottom-l">
            <div class="sc-price-l">$199</div>
            <div class="sc-btn-l">Add to cart</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- CTA -->
  <div class="cta-section-l">
    <div class="cta-glow-l"></div>
    <div class="cta-title-l">Ready to <em>explore</em><br>the collection?</div>
    <div class="cta-sub-l">Join 2 million+ customers who trust Nexus for their tech needs.</div>
    <div class="cta-btns-l">
      <a class="btn-primary-l" routerLink="/consumer">Browse all products →</a>
      <a class="btn-secondary-l" routerLink="/login">Sign Up Now</a>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer-l">
    <div class="footer-logo-l">Nexus</div>
    <div class="footer-links-l">
      <div class="footer-link-l">About</div>
      <div class="footer-link-l">Privacy</div>
      <div class="footer-link-l">Terms</div>
      <div class="footer-link-l">Contact</div>
    </div>
    <div class="footer-right-l">© 2025 Nexus</div>
  </div>

</div>
  `,
})
export class LandingComponent {
  auth = inject(AuthService);
  get dashboardLink() {
    const role = this.auth.currentUserValue?.role;
    if (role === 'ADMIN') return '/admin';
    if (role === 'MANAGER') return '/manager';
    return '/consumer';
  }
}

