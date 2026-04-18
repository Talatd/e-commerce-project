import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, AiService, ProductService, StoreService, AdminService, ToastService } from './services';

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
             <svg width="15" height="15" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#3ECFB2" opacity="0.9"/></svg>
             Google
          </button>
          <button class="soc-btn">
             <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.96.95-2.12 1.44-3.5 1.44-1.38 0-2.54-.49-3.5-1.44-.96-.95-1.44-2.11-1.44-3.48 0-1.37.48-2.53 1.44-3.48s2.12-1.44 3.5-1.44c1.38 0 2.54.49 3.5 1.44s1.44 2.11 1.44 3.48c0 1.37-.48 2.53-1.44 3.48z"/></svg>
             Apple
          </button>
        </div>
      </div>

      <!-- REGISTER -->
      <div class="form-view" [class.active]="mode === 'register'">
        <div class="name-row">
          <div class="field">
            <label class="field-label">First name</label>
            <input class="fi" placeholder="Buse"/>
          </div>
          <div class="field">
            <label class="field-label">Last name</label>
            <input class="fi" placeholder="U."/>
          </div>
        </div>
        <div class="field">
          <label class="field-label">Email Address</label>
          <input class="fi" placeholder="you@example.com" type="email"/>
        </div>
        <div class="field">
          <label class="field-label">Create Password</label>
          <input class="fi" placeholder="Min. 8 characters" type="password" (input)="pwStrength($event)"/>
          <div class="pw-bars">
            <div class="pw-bar" [style.background]="s >= 1 ? c : 'rgba(255,255,255,0.05)'"></div>
            <div class="pw-bar" [style.background]="s >= 2 ? c : 'rgba(255,255,255,0.05)'"></div>
            <div class="pw-bar" [style.background]="s >= 3 ? c : 'rgba(255,255,255,0.05)'"></div>
            <div class="pw-bar" [style.background]="s >= 4 ? c : 'rgba(255,255,255,0.05)'"></div>
          </div>
        </div>
        <button class="submit" (click)="setMode('login')">
          Create Account →
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

  auth = inject(AuthService);
  router = inject(Router);

  setMode(m: string) {
    this.mode = m;
  }

  pwStrength(event: any) {
    const v = event.target.value || '';
    this.s = 0;
    if(v.length >= 6) this.s++;
    if(v.length >= 10) this.s++;
    if(/[0-9!@#$%^&*]/.test(v)) this.s++;
    if(v.length >= 12 && /[A-Z]/.test(v)) this.s++;
    const colors = ['#E07070','#E8A94A','#E8A94A','#3EC98A'];
    this.c = this.s > 0 ? colors[this.s - 1] : 'rgba(255,255,255,0.05)';
  }

  onLogin() {
    this.isLoading = true;
    this.error = '';
    
    setTimeout(() => {
      this.auth.login({ email: this.email, password: this.password }).subscribe({
        next: (user) => {
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
}

@Component({
  selector: 'app-consumer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-frame">
      <div class="navbar-nexus">
        <div style="display:flex;align-items:center;gap:15px;">
          <div class="logo-admin" routerLink="/consumer"><div class="logo-dot-admin"></div>Nexus</div>
          <div class="search-box-nexus">
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="var(--text2)" stroke-width="1.2"/><path d="M9 9l2.5 2.5" stroke="var(--text2)" stroke-width="1.2" stroke-linecap="round"/></svg>
            <input [(ngModel)]="searchQuery" placeholder="Search premium products..."/>
          </div>
        </div>
        <div class="nav-r-nexus">
          <div class="mag-pill" style="font-size:11px; padding:6px 14px; border-radius:12px;" routerLink="/cart">Cart · {{auth.currentUserValue?.cartCount || 0}} items</div>
          <div class="nav-notif-nexus"><div class="notif-dot-nexus"></div><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5C4.8 1.5 3 3.3 3 5.5V8l-1 1.5h10L11 8V5.5c0-2.2-1.8-4-4-4Z" stroke="#6A8A84" stroke-width="1.1"/><path d="M5.5 11c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5" stroke="#6A8A84" stroke-width="1.1"/></svg></div>
          <div class="nav-av-nexus" routerLink="/settings">{{auth.currentUserValue?.fullName?.charAt(0)}}</div>
        </div>
      </div>
      <div class="body-frame">
        <div class="sidebar-nexus" style="width:240px; min-width:240px; padding:20px 16px;">
          <div class="filter-sect">
             <div class="fs-head" (click)="catOpen = !catOpen">
               <span>Categories</span>
               <svg [style.transform]="catOpen ? 'rotate(0deg)' : 'rotate(-90deg)'" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.2"/></svg>
             </div>
             <div class="fs-body" *ngIf="catOpen">
               <div class="cat-row-nexus" *ngFor="let c of categories" (click)="toggleFilter(c)">
                 <div class="cat-chk-nexus" [class.checked]="c.checked"></div>
                 <span>{{c.name}}</span>
               </div>
             </div>
          </div>
          <div class="filter-sect" style="margin-top:20px;">
             <div class="fs-head" (click)="priceOpen = !priceOpen">
               <span>Price Range</span>
               <svg [style.transform]="priceOpen ? 'rotate(0deg)' : 'rotate(-90deg)'" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.2"/></svg>
             </div>
             <div class="fs-body" *ngIf="priceOpen">
               <div style="padding:10px 0;">
                 <input type="range" min="0" max="2000" [(ngModel)]="maxPrice" class="range-nexus"/>
                 <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:11px; color:var(--text3); font-family:'JetBrains Mono';"><span>\$0</span><span>\${{maxPrice}}</span></div>
               </div>
             </div>
          </div>
          <div class="sidebar-foot-nexus" style="border-top:1px solid var(--border); padding-top:15px; margin-top:auto;">
             <button class="sc-btn-nexus" style="width:100%; border-radius:12px; margin-bottom:8px;" (click)="clearAll()">Clear Filters</button>
             <div class="s-user-nexus" *ngIf="auth.role === 'ADMIN'" routerLink="/admin">
               <div class="su-name-nexus">Admin Panel →</div>
             </div>
          </div>
        </div>
        <div class="main-nexus" style="display:flex; gap:0; padding:0;">
          <div style="flex:1; overflow-y:auto; padding:24px;">
            <div class="top-bar-nexus" style="margin-bottom:24px;">
              <div><div class="page-title-nexus">Curated Collection</div><div class="page-sub-nexus">Showing {{filteredProducts.length}} products based on your interest</div></div>
            </div>
            <div class="product-grid-nexus">
              <div class="pcard-nexus" *ngFor="let p of filteredProducts">
                <div class="pc-image-nexus" [routerLink]="['/product', p.productId]">
                  <img *ngIf="p.imageUrl" [src]="p.imageUrl" /><div class="pc-overlay-nexus">View Details</div>
                </div>
                <div class="pc-info-nexus">
                  <div class="pc-cat-nexus">{{p.category}}</div>
                  <div class="pc-name-nexus">{{p.name}}</div>
                  <div class="pc-footer-nexus">
                    <div class="pc-price-nexus">{{p.basePrice | currency}}</div>
                    <button class="pc-add-nexus" (click)="checkSentiment(p)">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 3.5v7M3.5 7h7" stroke="currentColor" stroke-width="1.2"/></svg>
                    </button>
                  </div>
                  <div *ngIf="sentiments[p.productId]" class="pc-sent-nexus" [class.pos]="sentiments[p.productId].averageScore > 0.5"><div class="pc-sent-dot"></div>{{sentiments[p.productId].sentimentLabel}}</div>
                </div>
              </div>
            </div>
            <div *ngIf="filteredProducts.length === 0" style="padding:100px 0; text-align:center;"><div style="font-size:32px; opacity:0.1; margin-bottom:12px;">∅</div><div style="color:var(--text3); font-size:14px;">No products match your filters.</div></div>
          </div>
          <div class="ai-side-nexus">
            <div class="ai-head-nexus"><div><div class="ai-title-nexus">Assistant</div><div class="ai-status-nexus">● Online</div></div><div class="ai-badge-nexus">AI</div></div>
            <div class="ai-body-nexus"><div *ngFor="let m of chatMessages" class="ai-msg-nexus" [class.user]="m.sender === 'user'"><div class="ai-bub-nexus">{{m.text}}</div></div></div>
            <div class="ai-foot-nexus"><input [(ngModel)]="prompt" (keyup.enter)="sendQuery()" placeholder="Search via AI..."/><div class="ai-send-nexus" (click)="sendQuery()">Send</div></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-frame { height: 100vh; display:flex; flex-direction:column; background:var(--bg); overflow:hidden; }
    .navbar-nexus { padding:14px 24px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border); background:rgba(8,8,8,0.9); backdrop-filter:blur(20px); z-index:100; }
    .search-box-nexus { display:flex; align-items:center; gap:10px; background:var(--glass); border:1px solid var(--border); border-radius:12px; padding:0 15px; width:300px; height:38px; }
    .search-box-nexus input { background:transparent; border:none; color:var(--text); font-size:12px; outline:none; flex:1; }
    .body-frame { display:flex; flex:1; overflow:hidden; }
    .sidebar-nexus { display:flex; flex-direction:column; gap:24px; border-right:1px solid var(--border); background:rgba(8,8,8,0.2); }
    .fs-head { display:flex; align-items:center; justify-content:space-between; font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em; font-weight:600; cursor:pointer; margin-bottom:15px; }
    .cat-row-nexus { display:flex; align-items:center; gap:10px; padding:6px 0; font-size:12.5px; color:var(--text2); cursor:pointer; transition:all 0.15s; }
    .cat-row-nexus:hover { color:var(--text); }
    .cat-chk-nexus { width:14px; height:14px; border-radius:4px; border:1px solid var(--border2); position:relative; }
    .cat-chk-nexus.checked { background:var(--teal); border-color:var(--teal); }
    .range-nexus { width:100%; height:4px; appearance:none; background:var(--glass2); border-radius:2px; outline:none; }
    .range-nexus::-webkit-slider-thumb { appearance:none; width:12px; height:12px; border-radius:50%; background:var(--teal); cursor:pointer; }
    .product-grid-nexus { display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:20px; }
    .pcard-nexus { background:var(--glass); border:1px solid var(--border); border-radius:16px; overflow:hidden; transition:all 0.3s cubic-bezier(0.4,0,0.2,1); }
    .pcard-nexus:hover { transform:translateY(-5px); border-color:var(--teal-glow); box-shadow:0 15px 35px rgba(0,0,0,0.4); }
    .pc-image-nexus { height:180px; background:rgba(255,255,255,0.02); display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; cursor:pointer; }
    .pc-image-nexus img { max-height:140px; }
    .pc-overlay-nexus { position:absolute; bottom:0; left:0; width:100%; padding:10px; background:rgba(62,207,178,0.8); color:#000; font-size:11px; font-weight:600; text-align:center; transform:translateY(100%); transition:transform 0.3s; }
    .pcard-nexus:hover .pc-overlay-nexus { transform:translateY(0); }
    .pc-info-nexus { padding:15px; }
    .pc-cat-nexus { font-size:9px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:5px; }
    .pc-name-nexus { font-size:13px; font-weight:500; color:var(--text); margin-bottom:12px; height:34px; line-height:1.3; }
    .pc-footer-nexus { display:flex; align-items:center; justify-content:space-between; }
    .pc-price-nexus { font-family:'JetBrains Mono',monospace; font-size:15px; color:var(--teal2); }
    .pc-add-nexus { width:28px; height:28px; border-radius:8px; border:1px solid var(--border2); background:var(--glass2); display:flex; align-items:center; justify-content:center; color:var(--text2); cursor:pointer; transition:0.2s; }
    .pc-add-nexus:hover { background:var(--teal); color:#000; border-color:var(--teal); }
    .pc-sent-nexus { margin-top:10px; font-size:10px; color:var(--amber); display:flex; align-items:center; gap:5px; }
    .pc-sent-nexus.pos { color:var(--green); }
    .pc-sent-dot { width:4px; height:4px; border-radius:50%; background:currentColor; }
    .ai-side-nexus { width:300px; border-left:1px solid var(--border); background:rgba(8,8,8,0.3); display:flex; flex-direction:column; }
    .ai-head-nexus { padding:20px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
    .ai-title-nexus { font-size:13px; font-weight:600; color:var(--text); }
    .ai-status-nexus { font-size:9px; color:var(--green); margin-top:2px; }
    .ai-badge-nexus { background:var(--teal-dim); color:var(--teal); padding:3px 8px; border-radius:8px; font-size:9px; font-weight:600; border:1px solid var(--border2); }
    .ai-body-nexus { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:12px; }
    .ai-msg-nexus { max-width:85%; padding:10px 14px; border-radius:14px; font-size:12px; line-height:1.5; background:var(--glass2); color:var(--text2); border:1px solid var(--border); align-self:flex-start; }
    .ai-msg-nexus.user { background:var(--teal-dim); color:var(--text); align-self:flex-end; border-color:var(--teal-glow); }
    .ai-foot-nexus { padding:20px; border-top:1px solid var(--border); display:flex; gap:10px; }
    .ai-foot-nexus input { flex:1; background:var(--glass); border:1px solid var(--border); padding:8px 12px; border-radius:10px; font-size:12px; color:var(--text); outline:none; }
    .ai-send-nexus { padding:8px 15px; background:var(--teal); color:#000; border-radius:10px; font-size:11.5px; font-weight:600; cursor:pointer; }
  `]
})
export class ConsumerComponent implements OnInit {
  products: any[] = [];
  sentiments: any = {};
  prompt = '';
  chatMessages: any[] = [];
  history: string[] = [];
  searchQuery = '';
  filtersOpen = true;
  maxPrice = 1500;
  catOpen = true;
  priceOpen = true;
  categories: {name: string, checked: boolean}[] = [];
  auth = inject(AuthService);
  ai = inject(AiService);
  productService = inject(ProductService);

  ngOnInit() {
    const role = this.auth.currentUserValue?.role || 'CONSUMER';
    const greetings: any = {
      'CONSUMER': 'Welcome to Nexus Store! I can help you find premium electronics.',
      'MANAGER': 'Nexus Manager AI at your service. I can help with stock alerts and sales trends.',
      'ADMIN': 'System-level AI online. I have full access to platform analytics and user management.'
    };
    this.chatMessages.push({ sender: 'ai', text: greetings[role] || greetings['CONSUMER'] });
    
    this.productService.getProducts().subscribe(res => {
      this.products = res;
      const cats = Array.from(new Set(this.products.map(p => p.category)));
      this.categories = cats.map((c: any) => ({ name: c, checked: false }));
    });
  }
  get activeFilters() { return this.categories.filter(c => c.checked).map(c => c.name); }
  get filteredProducts() {
    let list = this.products || [];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    list = list.filter(p => p.basePrice <= this.maxPrice);
    const selCats = this.activeFilters;
    if (selCats.length > 0) list = list.filter(p => selCats.includes(p.category));
    return list;
  }
  toggleFilter(c: any) { c.checked = !c.checked; }
  clearAll() { this.categories.forEach(c => c.checked = false); }
  checkSentiment(p: any) {
    this.productService.getSentiment(p.productId).subscribe(res => {
      this.sentiments[p.productId] = res;
    });
  }
  sendQuery() {
    if (!this.prompt) return;
    const userMsg = this.prompt;
    this.chatMessages.push({ sender: 'user', text: userMsg });
    this.prompt = '';
    const user = this.auth.currentUserValue || { userId: 1, role: 'CONSUMER' };
    this.ai.query(userMsg, user.userId, user.role, this.history).subscribe(res => {
      this.chatMessages.push({ sender: 'ai', text: res.response });
      this.history.push(`User: ${userMsg}`, `AI: ${res.response}`);
    });
  }
}

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-frame">
      <div class="navbar-nexus">
        <div style="display:flex;align-items:center;gap:15px;">
          <div class="logo-admin"><div class="logo-dot-admin"></div>Nexus</div>
          <div class="admin-badge-nexus" style="background:var(--blue-dim); color:var(--blue); border-color:rgba(107,168,200,0.2);">Manager</div>
        </div>
        <div class="nav-r-nexus">
          <div class="nav-notif-nexus"><div class="notif-dot-nexus"></div><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5C4.8 1.5 3 3.3 3 5.5V8l-1 1.5h10L11 8V5.5c0-2.2-1.8-4-4-4Z" stroke="#6A8A84" stroke-width="1.1"/><path d="M5.5 11c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5" stroke="#6A8A84" stroke-width="1.1"/></svg></div>
          <div class="nav-av-nexus">{{auth.currentUserValue?.fullName?.charAt(0)}}</div>
        </div>
      </div>
      <div class="body-frame">
        <div class="sidebar-nexus">
          <div class="sg-label-admin">Navigation</div>
          <div class="sitem-nexus active">
            <div class="sitem-l-nexus">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.2" fill="currentColor"/><rect x="7" y="1" width="5" height="5" rx="1.2" fill="currentColor"/><rect x="1" y="7" width="5" height="5" rx="1.2" fill="currentColor"/><rect x="7" y="7" width="5" height="5" rx="1.2" fill="currentColor"/></svg>
              Store Ops
            </div>
          </div>
          <div class="sitem-nexus" routerLink="/settings">
            <div class="sitem-l-nexus">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" stroke-width="1.1"/><path d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12" stroke="currentColor" stroke-width="1.1"/></svg>
              My Profile
            </div>
          </div>
          <div class="sidebar-foot-nexus">
            <div class="s-user-nexus" (click)="auth.logout()" style="cursor:pointer; margin-bottom:8px;">
              <div><div class="su-name-nexus">{{auth.currentUserValue?.fullName}}</div><div class="su-role-nexus">Manager · Logout</div></div>
            </div>
          </div>
        </div>
        <div class="main-nexus">
           <div class="panel-nexus">
             <div class="top-bar-nexus"><div><div class="page-title-nexus">Operations</div><div class="page-sub-nexus">Manage your store inventory and sales performance.</div></div></div>
             
             <div class="kpi-row-nexus">
              <div class="kpi-nexus"><div class="kpi-label-nexus">Your Products</div><div class="kpi-val-nexus">{{products.length}}</div><div class="kpi-delta-nexus up">↑ Active</div></div>
              <div class="kpi-nexus"><div class="kpi-label-nexus">Store Rating</div><div class="kpi-val-nexus">4.8★</div><div class="kpi-delta-nexus up">Excellent</div></div>
              <div class="kpi-nexus"><div class="kpi-label-nexus">Low Stock</div><div class="kpi-val-nexus">3</div><div class="kpi-delta-nexus" style="color:var(--red);">Action needed</div></div>
              <div class="kpi-nexus"><div class="kpi-label-nexus">Today's Sales</div><div class="kpi-val-nexus">$2,840</div><div class="kpi-delta-nexus up">↑ 8%</div></div>
             </div>

             <div class="table-card-nexus">
               <div class="gc-head-nexus"><div class="gc-title-nexus">Inventory Overview</div><button class="sc-btn-nexus primary" style="padding:6px 12px; font-size:10px;" (click)="addProduct()">+ Add Product</button></div>
               <table class="tbl-nexus">
                 <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                 <tbody>
                   <tr *ngFor="let p of products">
                     <td class="td-name-nexus">{{p.name}}</td>
                     <td>{{p.category}}</td>
                     <td class="td-mono-nexus">{{p.basePrice | currency}}</td>
                     <td><span class="spill-nexus" [class.sp-green]="p.stockQuantity > 10" [class.sp-amber]="p.stockQuantity <= 10">● {{p.stockQuantity}} units</span></td>
                     <td>
                       <button class="sc-btn-nexus danger" style="padding:2px 8px; font-size:9px;" (click)="deleteProduct(p)">Delete</button>
                     </td>
                   </tr>
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      </div>
    </div>
  `
})
export class ManagerComponent implements OnInit {
  products: any[] = [];
  productService = inject(ProductService);
  auth = inject(AuthService);
  toast = inject(ToastService);

  ngOnInit() {
    this.productService.getProducts().subscribe(res => this.products = res);
  }

  addProduct() {
    const name = prompt('Product Name:');
    if (!name) return;
    const price = prompt('Base Price:');
    const category = prompt('Category:');
    
    const newProd = {
      name,
      basePrice: parseFloat(price || '0'),
      category: category || 'Electronics',
      stockQuantity: 10,
      description: 'Newly added premium electronics item.'
    };

    this.productService.createProduct(newProd).subscribe({
      next: (res) => {
        this.products.push(res);
        this.toast.show('Product added successfully!');
      },
      error: () => this.toast.show('Failed to add product', 'error')
    });
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
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-frame">
      <!-- NAVBAR -->
      <div class="navbar-nexus">
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="logo-admin"><div class="logo-dot-admin"></div>Nexus</div>
          <div class="admin-badge-nexus">Admin</div>
        </div>
        <div class="nav-r-nexus">
          <div class="nav-notif-nexus">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5C4.8 1.5 3 3.3 3 5.5V8l-1 1.5h10L11 8V5.5c0-2.2-1.8-4-4-4Z" stroke="#6A8A84" stroke-width="1.1"/><path d="M5.5 11c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5" stroke="#6A8A84" stroke-width="1.1"/></svg>
            <div class="notif-dot-nexus"></div>
          </div>
          <div class="nav-av-nexus">{{auth.currentUserValue?.fullName?.charAt(0)}}</div>
        </div>
      </div>

      <div class="body-frame">
        <div class="sidebar-nexus" style="background: rgba(8,8,8,0.4);">
          <div class="sg-label-admin">Overview</div>
          <div class="sitem-nexus" [class.active]="tab === 'dashboard'" (click)="tab = 'dashboard'">
            <div class="sitem-l-nexus"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.6"/><rect x="7" y="1" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.4"/><rect x="1" y="7" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.4"/><rect x="7" y="7" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.3"/></svg>Dashboard</div>
          </div>

          <div class="sg-label-admin">Management</div>
          <div class="sitem-nexus" [class.active]="tab === 'stores'" (click)="tab = 'stores'">
            <div class="sitem-l-nexus"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 5.5h10v6a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-6Z" stroke="currentColor" stroke-width="1.1"/><path d="M.5 3l.8-1.5h10.4L12.5 3a2 2 0 0 1-2 2.5h-8A2 2 0 0 1 .5 3Z" stroke="currentColor" stroke-width="1.1"/></svg>Stores</div>
            <div class="sitem-badge-nexus green">{{stores.length}}</div>
          </div>
          <div class="sitem-nexus" [class.active]="tab === 'users'" (click)="tab = 'users'">
            <div class="sitem-l-nexus"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.5" stroke="currentColor" stroke-width="1.1"/><path d="M1.5 11.5c0-2.7 2-4 5-4s5 1.3 5 4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Users</div>
            <div class="sitem-badge-nexus">{{users.length}}</div>
          </div>
          <div class="sitem-nexus" [class.active]="tab === 'products'" (click)="tab = 'products'">
            <div class="sitem-l-nexus"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L1 4v5l5.5 3L12 9V4L6.5 1Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>Products</div>
          </div>
          <div class="sitem-nexus" [class.active]="tab === 'orders'" (click)="tab = 'orders'">
            <div class="sitem-l-nexus"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2h1.5l2 7h6l1.5-4.5H4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="11" r="1" fill="currentColor"/><circle cx="10" cy="11" r="1" fill="currentColor"/></svg>Orders</div>
          </div>

          <div class="sg-label-admin" style="margin-top:auto;">System</div>
          <div class="sitem-nexus" [class.active]="tab === 'settings'" (click)="tab = 'settings'">
            <div class="sitem-l-nexus"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" stroke-width="1.1"/><path d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12M2.6 2.6l.85.85M9.55 9.55l.85.85M2.6 10.4l.85-.85M9.55 3.45l.85-.85" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Config</div>
          </div>

          <div class="sidebar-foot-nexus">
            <div class="s-user-nexus" (click)="auth.logout()" title="Logout" style="cursor:pointer; margin-bottom: 8px;">
              <div class="nav-av-nexus" style="width:26px;height:26px;font-size:10px;flex-shrink:0;">{{auth.currentUserValue?.fullName?.charAt(0)}}</div>
              <div><div class="su-name-nexus">{{auth.currentUserValue?.fullName}}</div><div class="su-role-nexus">Admin · Logout</div></div>
            </div>
            <button class="sc-btn-nexus" style="width:100%; border-radius:12px; font-size:10px; opacity:0.7;" [routerLink]="['/consumer']">← Shop View</button>
          </div>
        </div>

        <div class="main-nexus">
          <div *ngIf="isLoading" style="padding:40px; text-align:center; color:var(--teal);">
            <div class="set-spin" style="font-size:32px;">◌</div>
            <div style="margin-top:12px; font-size:12px; letter-spacing:0.1em;">FETCHING PLATFORM DATA...</div>
          </div>
          <!-- DASHBOARD PANEL -->
          <div class="panel-nexus" *ngIf="tab === 'dashboard'">
            <div class="top-bar-nexus">
              <div><div class="page-title-nexus">Dashboard</div><div class="page-sub-nexus">Friday, 17 April · Platform overview</div></div>
              <div class="top-actions-nexus">
                <button class="tbtn-nexus ghost">Export Report</button>
                <button class="tbtn-nexus primary">+ Add Store</button>
              </div>
            </div>

            <div class="kpi-row-nexus">
              <div class="kpi-nexus"><div class="kpi-label-nexus">Platform Revenue</div><div class="kpi-val-nexus">{{stats.totalRevenue | currency}}</div><div class="kpi-delta-nexus up">↑ {{stats.revenueGrowth}}% this month</div></div>
              <div class="kpi-nexus"><div class="kpi-label-nexus">Total Orders</div><div class="kpi-val-nexus">{{stats.totalOrders}}</div><div class="kpi-delta-nexus up">↑ Active</div></div>
              <div class="kpi-nexus"><div class="kpi-label-nexus">Active Stores</div><div class="kpi-val-nexus">{{stats.totalStores}}</div><div class="kpi-delta-nexus up">↑ Online</div></div>
              <div class="kpi-nexus"><div class="kpi-label-nexus">Total Users</div><div class="kpi-val-nexus">{{stats.totalUsers}}</div><div class="kpi-delta-nexus up">↑ {{stats.activeSessions}} live sessions</div></div>
            </div>

            <div class="chart-row-nexus">
              <div class="gcard-nexus">
                <div class="gc-head-nexus"><div class="gc-title-nexus">Revenue by Month</div><div class="gc-link-nexus">Full report →</div></div>
                <div class="gc-body-nexus">
                  <div class="bar-chart-nexus">
                    <div class="bc-col-nexus" *ngFor="let m of months; let i = index">
                      <div class="bc-bar-nexus" [class.active-bar]="i === 9" [style.height.%]="m.val"></div>
                      <div class="bc-label-nexus" [style.color]="i === 9 ? 'var(--teal2)' : 'var(--text3)'">{{m.label}}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="gcard-nexus">
                <div class="gc-head-nexus"><div class="gc-title-nexus">Revenue Split</div></div>
                <div class="gc-body-nexus">
                  <div class="donut-wrap-nexus">
                    <svg width="72" height="72" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r="26" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="12"/>
                      <circle cx="36" cy="36" r="26" fill="none" stroke="#3ECFB2" stroke-width="12" stroke-dasharray="72 163" stroke-dashoffset="0" transform="rotate(-90 36 36)"/>
                      <circle cx="36" cy="36" r="26" fill="none" stroke="#6BA8C8" stroke-width="12" stroke-dasharray="32 163" stroke-dashoffset="-72" transform="rotate(-90 36 36)"/>
                      <circle cx="36" cy="36" r="26" fill="none" stroke="#E8A94A" stroke-width="12" stroke-dasharray="23 163" stroke-dashoffset="-104" transform="rotate(-90 36 36)"/>
                    </svg>
                    <div class="donut-legend-nexus">
                      <div class="dl-item-nexus"><div class="dl-dot-nexus" style="background:var(--teal)"></div>Electronics 44%</div>
                      <div class="dl-item-nexus"><div class="dl-dot-nexus" style="background:var(--blue)"></div>Accessories 20%</div>
                      <div class="dl-item-nexus"><div class="dl-dot-nexus" style="background:var(--amber)"></div>Peripherals 14%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="table-card-nexus">
              <div class="gc-head-nexus"><div class="gc-title-nexus">Recent Orders — All Stores</div><div class="gc-link-nexus">View all →</div></div>
              <table class="tbl-nexus">
                <thead><tr><th>Order</th><th>Customer</th><th>Store</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  <tr *ngFor="let o of orders.slice(0,3)">
                    <td class="td-mono-nexus">{{o.id}}</td>
                    <td class="td-name-nexus">{{o.customer}}</td>
                    <td>{{o.store}}</td>
                    <td class="td-amt-nexus">{{o.amount}}</td>
                    <td><span class="spill-nexus" [ngClass]="o.class">● {{o.status}}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- ANALYTICS PANEL -->
          <div class="panel-nexus" *ngIf="tab === 'analytics'">
            <div class="top-bar-nexus"><div><div class="page-title-nexus">Analytics</div><div class="page-sub-nexus">Deep platform insights.</div></div></div>
            <div class="kpi-row-nexus">
              <div class="kpi-nexus"><div class="kpi-label-nexus">Conversion Rate</div><div class="kpi-val-nexus">3.2%</div><div class="kpi-delta-nexus up">↑ 0.4%</div></div>
              <div class="kpi-nexus"><div class="kpi-label-nexus">Avg Order Value</div><div class="kpi-val-nexus">$68.5</div><div class="kpi-delta-nexus up">↑ 12%</div></div>
              <div class="kpi-nexus"><div class="kpi-label-nexus">Return Rate</div><div class="kpi-val-nexus">4.8%</div><div class="kpi-delta-nexus" style="color:var(--red);">↑ 0.2%</div></div>
              <div class="kpi-nexus"><div class="kpi-label-nexus">Active Sessions</div><div class="kpi-val-nexus">847</div><div class="kpi-delta-nexus up">Live</div></div>
            </div>
            <div class="gcard-nexus"><div class="gc-head-nexus"><div class="gc-title-nexus">Traffic by Store</div></div><div class="gc-body-nexus">
              <div style="display:flex;flex-direction:column;gap:12px;">
                <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12px;color:var(--text2);width:100px;">Nexus Main</span><div style="flex:1;height:3px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;"><div style="width:72%;height:100%;background:var(--teal);border-radius:2px;"></div></div><span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3);">72%</span></div>
                <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12px;color:var(--text2);width:100px;">TechHub</span><div style="flex:1;height:3px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;"><div style="width:48%;height:100%;background:var(--blue);border-radius:2px;"></div></div><span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3);">48%</span></div>
                <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12px;color:var(--text2);width:100px;">GadgetPro</span><div style="flex:1;height:3px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;"><div style="width:31%;height:100%;background:var(--amber);border-radius:2px;"></div></div><span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3);">31%</span></div>
              </div>
            </div></div>
          </div>

          <!-- STORES PANEL -->
          <div class="panel-nexus" *ngIf="tab === 'stores'">
            <div class="top-bar-nexus">
              <div><div class="page-title-nexus">Store Management</div><div class="page-sub-nexus">Approve, open or close stores.</div></div>
              <div class="top-actions-nexus"><button class="tbtn-nexus primary">+ New Store</button></div>
            </div>
            <div class="store-grid-nexus">
              <div class="store-card-nexus" *ngFor="let s of stores">
                <div class="sc-top-nexus">
                  <div><div class="sc-name-nexus">{{s.name}}</div><div class="sc-owner-nexus">Owner: {{s.ownerName}}</div></div>
                  <div class="sc-status-nexus" [class.sc-open]="s.status === 'OPEN'"><div class="sc-dot-nexus" [class.green]="s.status === 'OPEN'"></div>{{s.status}}</div>
                </div>
                <div class="sc-stats-nexus">
                  <div class="sc-stat-nexus"><div class="sc-stat-val-nexus">{{s.totalRevenue | currency}}</div><div class="sc-stat-label-nexus">Revenue</div></div>
                  <div class="sc-stat-nexus"><div class="sc-stat-val-nexus">{{s.orderCount}}</div><div class="sc-stat-label-nexus">Orders</div></div>
                  <div class="sc-stat-nexus"><div class="sc-stat-val-nexus">{{s.rating}}★</div><div class="sc-stat-label-nexus">Rating</div></div>
                </div>
                <div class="sc-actions-nexus">
                  <button class="sc-btn-nexus">View</button>
                  <button class="sc-btn-nexus danger">Close Store</button>
                </div>
              </div>
            </div>
          </div>

          <!-- USERS PANEL -->
          <div class="panel-nexus" *ngIf="tab === 'users'">
            <div class="top-bar-nexus">
              <div><div class="page-title-nexus">User Management</div><div class="page-sub-nexus">View, suspend or ban users.</div></div>
              <div class="top-actions-nexus"><button class="tbtn-nexus primary">+ Add User</button></div>
            </div>
            <div class="table-card-nexus">
              <table class="tbl-nexus">
                <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  <tr *ngFor="let u of users">
                    <td class="td-name-nexus">{{u.fullName}}</td>
                    <td>{{u.email}}</td>
                    <td><span class="spill-nexus sp-blue">{{u.role}}</span></td>
                    <td><span class="spill-nexus sp-green">Active</span></td>
                    <td>
                      <div style="display:flex; gap:6px;">
                        <button class="sc-btn-nexus" style="padding:2px 8px; border-radius:8px;">Edit</button>
                        <button class="sc-btn-nexus danger" style="padding:2px 8px; border-radius:8px;" (click)="banUser(u)">Ban</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- PRODUCTS PANEL -->
          <div class="panel-nexus" *ngIf="tab === 'products'">
            <div class="top-bar-nexus">
              <div><div class="page-title-nexus">Product Catalog</div><div class="page-sub-nexus">Manage all store products.</div></div>
              <div class="top-actions-nexus"><button class="tbtn-nexus primary">+ Add Product</button></div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px;">
               <div class="store-card-nexus" *ngFor="let p of pagedProducts">
                 <div style="margin-bottom:12px; height:80px; background:rgba(255,255,255,0.02); border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                    <img *ngIf="p.imageUrl" [src]="p.imageUrl" style="max-height:60px; border-radius:4px;"/>
                 </div>
                 <div class="sc-name-nexus">{{p.name}}</div>
                 <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                   <div style="font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--teal);">{{p.basePrice | currency}}</div>
                   <div class="spill-nexus sp-green" style="font-size:9px;">In Stock</div>
                 </div>
               </div>
            </div>
          </div>

          <!-- ORDERS PANEL -->
          <div class="panel-nexus" *ngIf="tab === 'orders'">
            <div class="top-bar-nexus"><div><div class="page-title-nexus">All Orders</div><div class="page-sub-nexus">Manage platform-wide orders.</div></div></div>
            <div class="table-card-nexus">
              <table class="tbl-nexus">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Store</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  <tr *ngFor="let o of orders">
                    <td class="td-mono-nexus">{{o.id}}</td>
                    <td class="td-name-nexus">{{o.customer}}</td>
                    <td>{{o.store}}</td>
                    <td class="td-amt-nexus">{{o.amount}}</td>
                    <td><span class="spill-nexus" [ngClass]="o.class">● {{o.status}}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- SETTINGS PANEL -->
          <div class="panel-nexus" *ngIf="tab === 'settings'">
            <div class="top-bar-nexus" style="margin-bottom:24px;">
              <div><div class="page-title-nexus">System Settings</div><div class="page-sub-nexus">Configure platform-wide behavior and AI parameters.</div></div>
              <button class="set-save-btn" (click)="saveSettings($event)" style="transform: scale(0.9);">Save Configuration</button>
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
              <div class="set-notif-list" style="border-radius:14px;">
                <div style="padding:16px 20px; border-bottom:1px solid var(--border); font-size:10px; text-transform:uppercase; letter-spacing:0.1em; color:var(--text3); font-weight:600;">Core Platform</div>
                <div class="set-notif-row">
                  <div class="set-notif-body">
                    <div class="set-notif-title">Maintenance Mode</div>
                    <div class="set-notif-desc">Disable public access to the storefront</div>
                  </div>
                  <div class="set-tog" [class.on]="sysSettings.maintenance" (click)="sysSettings.maintenance = !sysSettings.maintenance"><div class="set-tog-thumb"></div></div>
                </div>
                <div class="set-notif-row">
                  <div class="set-notif-body">
                    <div class="set-notif-title">New Registrations</div>
                    <div class="set-notif-desc">Allow new users to create accounts</div>
                  </div>
                  <div class="set-tog" [class.on]="sysSettings.registrations" (click)="sysSettings.registrations = !sysSettings.registrations"><div class="set-tog-thumb"></div></div>
                </div>
              </div>

              <div class="set-notif-list" style="border-radius:14px;">
                <div style="padding:16px 20px; border-bottom:1px solid var(--border); font-size:10px; text-transform:uppercase; letter-spacing:0.1em; color:var(--text3); font-weight:600;">AI Engine</div>
                <div class="set-notif-row">
                  <div class="set-notif-body">
                    <div class="set-notif-title">Text2SQL Assistant</div>
                    <div class="set-notif-desc">Enable LangGraph-powered AI shopping assistant</div>
                  </div>
                  <div class="set-tog" [class.on]="sysSettings.aiAssistant" (click)="sysSettings.aiAssistant = !sysSettings.aiAssistant"><div class="set-tog-thumb"></div></div>
                </div>
                <div class="set-notif-row">
                  <div class="set-notif-body">
                    <div class="set-notif-title">Sentiment Analysis</div>
                    <div class="set-notif-desc">Auto-calculate product sentiment on review</div>
                  </div>
                  <div class="set-tog" [class.on]="sysSettings.aiSentiment" (click)="sysSettings.aiSentiment = !sysSettings.aiSentiment"><div class="set-tog-thumb"></div></div>
                </div>
              </div>
            </div>

            <div class="set-danger-zone" style="margin-top:24px; border-radius:14px;">
              <div class="set-dz-title">Advanced: Re-index Database</div>
              <div class="set-dz-desc">Recalculate all AI embeddings and refresh search index. This may take several minutes and impact performance.</div>
              <button class="set-dz-btn" (click)="reindex($event)">Re-index Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  tab = 'dashboard';
  isLoading = true;
  auth = inject(AuthService);
  productService = inject(ProductService);
  storeService = inject(StoreService);
  adminService = inject(AdminService);
  toast = inject(ToastService);
  
  months = [
    {label:'J', val:35}, {label:'F', val:52}, {label:'M', val:44}, {label:'A', val:68},
    {label:'M', val:55}, {label:'J', val:72}, {label:'J', val:61}, {label:'A', val:80},
    {label:'S', val:65}, {label:'O', val:100}, {label:'N', val:74}, {label:'D', val:30}
  ];
  
  stores: any[] = [];
  users: any[] = [];
  orders: any[] = [];
  pagedProducts: any[] = [];
  stats: any = {};
  breakdown: any = { categories: [], regions: [] };

  sysSettings = {
    maintenance: false,
    registrations: true,
    aiAssistant: true,
    aiSentiment: true
  };

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.isLoading = true;
    const reqs = [
      this.productService.getProducts(),
      this.storeService.getStores(),
      this.adminService.getUsers(),
      this.adminService.getOrders(),
      this.adminService.getStats(),
      this.adminService.getSalesBreakdown()
    ];

    import('rxjs').then(({ forkJoin }) => {
      forkJoin(reqs).subscribe({
        next: (results: any) => {
          const res = results as any[];
          this.pagedProducts = res[0];
          this.stores = res[1];
          this.users = res[2];
          this.orders = res[3];
          this.stats = res[4];
          this.breakdown = res[5];
          if (this.stats && this.stats.monthlyRevenue) {
             this.months = this.stats.monthlyRevenue;
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.toast.show('Failed to fetch platform data', 'error');
          this.isLoading = false;
        }
      });
    });
  }

  saveSettings(event: any) {
    const btn = event.currentTarget;
    const oldHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="set-spin">◌</span> Saving...';
    setTimeout(() => {
      btn.innerHTML = '✓ Saved';
      btn.style.background = 'var(--green)';
      setTimeout(() => {
        btn.innerHTML = oldHtml;
        btn.disabled = false;
        btn.style.background = '';
      }, 2000);
    }, 1000);
  }

  reindex(event: any) {
    const btn = event.currentTarget;
    btn.innerHTML = 'Indexleme Başladı...';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = 'Re-index Now';
      btn.disabled = false;
    }, 5000);
  }

  banUser(u: any) {
    if (!confirm(`Are you sure you want to ban ${u.fullName}?`)) return;
    this.adminService.banUser(u.userId).subscribe({
      next: () => {
        this.toast.show(`User ${u.fullName} has been banned`, 'success');
        this.refreshData();
      }
    });
  }

  deleteUser(u: any) {
    if (!confirm(`Are you sure you want to delete ${u.fullName}?`)) return;
    this.adminService.deleteUser(u.userId).subscribe({
      next: () => {
        this.toast.show('User deleted', 'success');
        this.refreshData();
      }
    });
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
            </div>
          </div>

          <div class="panel-nexus" *ngIf="tab === 'password'">
             <div class="top-bar-nexus"><div><div class="page-title-nexus">Security</div><div class="page-sub-nexus">Change your access credentials.</div></div></div>
             <div class="card-nexus" style="max-width:400px; padding:24px; margin-top:20px;">
                <div class="field-nexus" style="margin-bottom:15px;"><label>Current Password</label><input type="password" placeholder="••••••••"/></div>
                <div class="field-nexus" style="margin-bottom:15px;"><label>New Password</label><input type="password" placeholder="••••••••" (input)="updatePwStrength($event)"/></div>
                <div style="display:flex; gap:4px; margin-bottom:15px;">
                  <div *ngFor="let i of [1,2,3,4]" [style.background]="pwS >= i ? pwC : 'var(--glass)'" style="flex:1; height:3px; border-radius:2px;"></div>
                </div>
                <button class="sc-btn-nexus primary" style="width:100%;" (click)="saveProfile($event)">Update Password</button>
             </div>
          </div>

          <div class="panel-nexus" *ngIf="tab === 'addresses'">
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
  pwS = 0; pwC = '';
  
  auth = inject(AuthService);
  toast = inject(ToastService);
  router = inject(Router);

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => {
      if (u) {
        this.editUser = { ...u };
      }
    });
  }

  goBack() {
    const role = this.editUser.role || 'CONSUMER';
    if(role === 'ADMIN') this.router.navigate(['/admin']);
    else if(role === 'MANAGER') this.router.navigate(['/manager']);
    else this.router.navigate(['/consumer']);
  }

  saveProfile(event: any) {
    const btn = event.currentTarget;
    const oldText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="set-spin">◌</span> Saving...';
    
    setTimeout(() => {
      this.auth.updateUser(this.editUser);
      this.toast.show('Profile updated successfully!', 'success');
      btn.innerHTML = '✓ Saved';
      setTimeout(() => {
        btn.innerHTML = oldText;
        btn.disabled = false;
      }, 2000);
    }, 1000);
  }

  updatePwStrength(ev: any) {
    const v = ev.target.value || '';
    this.pwS = 0;
    if(v.length >= 6) this.pwS++;
    if(v.length >= 10) this.pwS++;
    if(/[0-9]/.test(v)) this.pwS++;
    if(/[A-Z]/.test(v)) this.pwS++;
    const colors = ['#E07070','#E8A94A','#E8A94A','#3EC98A'];
    this.pwC = this.pwS > 0 ? colors[this.pwS-1] : '';
  }
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<style>
.landing-page{
  background:var(--bg);
  font-family:'Plus Jakarta Sans',sans-serif;
  color:var(--text);
  min-height: 100vh;
}
.navbar-l{
  display:flex;align-items:center;justify-content:space-between;
  padding:20px 32px;
  border-bottom:1px solid var(--border);
  background:rgba(8,8,8,0.92);
  backdrop-filter:blur(20px);
  position:sticky;top:0;z-index:100;
}
.logo-l{font-family:'Playfair Display',serif;font-style:italic;font-size:20px;color:var(--text);display:flex;align-items:center;gap:8px;}
.logo-dot-l{width:7px;height:7px;border-radius:50%;background:var(--teal);box-shadow:0 0 8px var(--teal-glow);}
.nav-pills-l{display:flex;align-items:center;gap:3px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:30px;padding:4px;}
.npill-l{padding:6px 16px;border-radius:20px;font-size:12px;color:var(--text2);cursor:pointer;transition:all 0.2s;}
.npill-l.active{background:var(--teal-dim);color:var(--teal2);border:1px solid rgba(62,207,178,0.18);}
.nav-r-l{display:flex;align-items:center;gap:8px;}
.nbtn-l{padding:7px 18px;border-radius:20px;font-size:12px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif; text-decoration: none;}
.nbtn-ghost-l{background:transparent;border:1px solid var(--border2);color:var(--text2);}
.nbtn-teal-l{background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);color:var(--teal2);}

.hero-l{
  min-height:600px;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  text-align:center;
  padding:100px 40px;
  position:relative;
  overflow:hidden;
}

.hero-glow-1-l{position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:600px;height:400px;background:radial-gradient(ellipse,rgba(62,207,178,0.08) 0%,transparent 65%);pointer-events:none;}
.hero-glow-2-l{position:absolute;bottom:-100px;left:20%;width:300px;height:300px;background:radial-gradient(circle,rgba(62,207,178,0.05) 0%,transparent 65%);pointer-events:none;}

.hero-badge-l{
  display:inline-flex;align-items:center;gap:6px;
  background:var(--teal-dim);border:1px solid rgba(62,207,178,0.2);
  color:var(--teal2);font-size:11px;padding:5px 14px;border-radius:20px;
  margin-bottom:28px;letter-spacing:0.04em;
}
.badge-dot-l{width:5px;height:5px;border-radius:50%;background:var(--teal);animation:pulse-l 2s infinite;}
@keyframes pulse-l{0%,100%{opacity:1;}50%{opacity:0.4;}}

.hero-title-l{
  font-family:'Playfair Display',serif;
  font-size:64px;font-weight:400;
  color:var(--text);line-height:1.1;
  letter-spacing:-0.02em;
  margin-bottom:10px;
  max-width:800px;
}
.hero-title-l em{font-style:italic;color:var(--teal2);}

.hero-sub-l{
  font-size:16px;color:var(--text2);
  line-height:1.7;max-width:520px;
  margin:16px auto 40px;font-weight:300;
}

.hero-cta-l{display:flex;align-items:center;gap:12px;justify-content:center;}
.btn-primary-l{
  padding:14px 32px;border-radius:24px;
  background:var(--teal);color:#080808;
  font-size:14px;font-weight:600;cursor:pointer;
  transition:all 0.2s; border:none; text-decoration:none;
}
.btn-primary-l:hover { background: var(--teal2); }
.btn-secondary-l{
  padding:14px 32px;border-radius:24px;
  background:transparent;color:var(--text2);
  font-size:14px;cursor:pointer;
  border:1px solid var(--border2);transition:all 0.2s; text-decoration:none;
}
.btn-secondary-l:hover { color:var(--text); border-color:rgba(255,255,255,0.2); }

.stats-l{
  border-top:1px solid var(--border);border-bottom:1px solid var(--border);
  display:grid;grid-template-columns:repeat(4,1fr);
}
.stat-item-l{
  padding:32px 0;text-align:center;
  border-right:1px solid var(--border);
}
.stat-item-l:last-child{border-right:none;}
.stat-val-l{font-family:'Playfair Display',serif;font-size:36px;color:var(--text);line-height:1;margin-bottom:6px;}
.stat-val-l em{font-style:italic;color:var(--teal2);}

.features-l{padding:80px 40px; text-align:center;}
.feat-grid-l{display:grid;grid-template-columns:repeat(3,1fr);gap:24px; margin-top:60px;}
.feat-card-l{
  background:var(--glass); border:1px solid var(--border);
  padding:40px 32px; border-radius:20px; text-align:left;
  transition:all 0.3s;
}
.feat-card-l:hover{border-color:var(--teal-glow); transform:translateY(-5px);}
.feat-icon-l { margin-bottom: 20px; color: var(--teal); }
.feat-title-l{font-size:18px;font-weight:500;color:var(--text);margin-bottom:12px;}
.feat-desc-l{font-size:14px;color:var(--text2);line-height:1.7;}

.footer-l{
  padding:40px; border-top:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
}
</style>

<div class="landing-page">
  <div class="navbar-l">
    <div class="logo-l"><div class="logo-dot-l"></div>Nexus</div>
    <div class="nav-pills-l">
      <div class="npill-l active">Home</div>
      <div class="npill-l" routerLink="/consumer">Shop</div>
      <div class="npill-l">About</div>
    </div>
    <div class="nav-r-l" *ngIf="!auth.currentUserValue">
      <a routerLink="/login" class="nbtn-l nbtn-ghost-l">Sign in</a>
      <a routerLink="/login" class="nbtn-l nbtn-teal-l">Join Now</a>
    </div>
    <div class="nav-r-l" *ngIf="auth.currentUserValue">
      <a [routerLink]="dashboardLink" class="nbtn-l nbtn-teal-l">Dashboard</a>
    </div>
  </div>

  <div class="hero-l">
    <div class="hero-glow-1-l"></div>
    <div class="hero-glow-2-l"></div>
    <div class="hero-badge-l"><div class="badge-dot-l"></div>Premium Tech Commerce</div>
    <h1 class="hero-title-l">The future of<br><em>tech shopping</em><br>is here.</h1>
    <p class="hero-sub-l">Discover curated premium technology products. Seamless experience, intelligent recommendations, effortless checkout.</p>
    <div class="hero-cta-l">
      <a routerLink="/consumer" class="btn-primary-l">Start Exploring →</a>
      <a routerLink="/consumer" class="btn-secondary-l">Learn more</a>
    </div>
  </div>

  <div class="stats-l">
    <div class="stat-item-l"><div class="stat-val-l">50<em>K+</em></div><div style="font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em;">Products</div></div>
    <div class="stat-item-l"><div class="stat-val-l">2<em>M+</em></div><div style="font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em;">Customers</div></div>
    <div class="stat-item-l"><div class="stat-val-l">4.9<em>★</em></div><div style="font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em;">Rating</div></div>
    <div class="stat-item-l"><div class="stat-val-l">24<em>/7</em></div><div style="font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.1em;">Support</div></div>
  </div>

  <div class="features-l">
    <div style="font-size:10px; color:var(--teal); text-transform:uppercase; letter-spacing:0.2em; margin-bottom:12px;">Why Nexus</div>
    <h2 style="font-family:'Playfair Display',serif; font-size:36px; font-weight:400; font-style:italic;">Built for the modern buyer</h2>
    <div class="feat-grid-l">
      <div class="feat-card-l">
        <div class="feat-icon-l">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
        </div>
        <div class="feat-title-l">Curated Selection</div>
        <div class="feat-desc-l">Every product is hand-picked and verified by our team of tech experts before listing.</div>
      </div>
      <div class="feat-card-l">
        <div class="feat-icon-l">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        </div>
        <div class="feat-title-l">AI Recommendations</div>
        <div class="feat-desc-l">Our Text2SQL AI assistant helps you find exactly what you need in seconds.</div>
      </div>
      <div class="feat-card-l">
        <div class="feat-icon-l">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        </div>
        <div class="feat-title-l">Seamless Checkout</div>
        <div class="feat-desc-l">Multiple payment options, one-click reorder, and real-time shipment tracking.</div>
      </div>
    </div>
  </div>

  <div class="footer-l">
    <div style="font-family:'Playfair Display',serif; font-style:italic; opacity:0.6;">Nexus</div>
    <div style="display:flex; gap:24px; font-size:12px; color:var(--text3);">
       <span>Terms</span> <span>Privacy</span> <span>Contact</span>
    </div>
    <div style="font-size:12px; color:var(--text3); font-family:'JetBrains Mono',monospace;">© 2025 NEXUS</div>
  </div>
</div>
  `
})
export class LandingComponent {
  auth = inject(AuthService);
  get dashboardLink() {
    const role = this.auth.currentUserValue?.role;
    if(role === 'ADMIN') return '/admin';
    if(role === 'MANAGER') return '/manager';
    return '/consumer';
  }
}
