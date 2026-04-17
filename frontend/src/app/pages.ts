import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AiService, ProductService } from './services';

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
      <svg width="28" height="28" viewBox="0 0 44 44" fill="none">
        <path d="M22 4L38 13V31L22 40L6 31V13L22 4Z" stroke="#3ECFB2" stroke-width="1.5" fill="rgba(62,207,178,0.08)" stroke-linejoin="round"/>
        <path d="M22 4V22M22 22L38 13M22 22L6 13" stroke="#3ECFB2" stroke-width="1" opacity="0.5"/>
        <path d="M22 22V40M22 22L38 31M22 22L6 31" stroke="#3ECFB2" stroke-width="1" opacity="0.28"/>
        <circle cx="22" cy="22" r="3.5" fill="#3ECFB2"/>
      </svg>
      Nexus
    </div>

    <!-- TOGGLE -->
    <div class="toggle-wrap">
      <div class="toggle-bg" id="tbg" [style.left.px]="mode === 'login' ? 4 : 115" [style.width.px]="mode === 'login' ? 111 : 124"></div>
      <div class="t-opt" [class.active]="mode === 'login'" (click)="setMode('login')">Sign In</div>
      <div class="t-opt" [class.active]="mode === 'register'" (click)="setMode('register')">Create Account</div>
    </div>

    <!-- HEADLINE -->
    <div class="headline-wrap">
      <div class="headline" [ngClass]="mode === 'login' ? 'visible' : 'up'">
        <div class="hl-title">Welcome <em>back.</em></div>
        <div class="hl-sub">Sign in to continue to your account.</div>
      </div>
      <div class="headline" [ngClass]="mode === 'login' ? 'down' : 'visible'">
        <div class="hl-title">Join <em>Nexus</em> today.</div>
        <div class="hl-sub">Create your free account in seconds.</div>
      </div>
    </div>

    <!-- FORMS -->
    <div class="form-outer" id="form-outer">
      <!-- LOGIN -->
      <div class="form" [ngClass]="mode === 'login' ? 'visible' : 'left'">
        <div class="field">
          <div class="field-label">Email</div>
          <input class="fi" [(ngModel)]="email" placeholder="you@example.com" type="email"/>
        </div>
        <div class="field">
          <div class="field-label">Password</div>
          <input class="fi" [(ngModel)]="password" placeholder="Enter password" type="password" (keyup.enter)="onLogin()"/>
          <div class="forgot">Forgot password?</div>
        </div>
        
        <p *ngIf="error" style="color:var(--red); font-size:11px; margin-top:2px;">{{error}}</p>

        <button class="submit" (click)="onLogin()" [disabled]="isLoading">
          <span *ngIf="!isLoading">Sign In →</span>
          <span *ngIf="isLoading" class="spin">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5A5 5 0 1 1 1.5 6.5" stroke="#080808" stroke-width="1.5" stroke-linecap="round"/></svg>
          </span>
        </button>
        <div class="div-row"><div class="div-line"></div><div class="div-text">or</div><div class="div-line"></div></div>
        <div class="social-row">
          <div class="soc-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M13 7.1c0-.5 0-.9-.1-1.3H7v2.5h3.4c-.1.8-.6 1.5-1.4 2v1.6h2.2C12.4 10.7 13 9 13 7.1Z" fill="#6A8A84" opacity="0.8"/><path d="M7 13c1.7 0 3.2-.6 4.2-1.5l-2.1-1.7c-.6.4-1.3.6-2.1.6-1.6 0-3-1.1-3.5-2.6H1.3V9.5C2.3 11.6 4.5 13 7 13Z" fill="#6A8A84" opacity="0.6"/><path d="M3.5 7.9c-.1-.4-.2-.8-.2-1.2s.1-.8.2-1.2V3.8H1.3C.5 5 0 6.4 0 8s.5 3 1.3 4.2L3.5 7.9Z" fill="#6A8A84" opacity="0.7"/><path d="M7 2.8c.9 0 1.7.3 2.4 1l1.8-1.8C10.2 1 8.7.5 7 .5 4.5.5 2.3 1.9 1.3 4L3.5 5.7C4 4.2 5.4 2.8 7 2.8Z" fill="#6A8A84"/></svg>
            Google
          </div>
          <div class="soc-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 7c0-1.9 1-3 2.5-3.4-.9-1.3-2.3-1.6-3.2-1.6-1.3 0-2.3.8-2.8.8s-1.4-.7-2.5-.7C2.7 2.1 1 3.8 1 6.5c0 3.8 2.7 6.5 4.2 6.5.8 0 1.8-.8 2.8-.8s1.8.8 2.8.8c.8 0 2-1 2.9-2.7-1.7-.7-3.2-2-3.2-3.3Z" fill="#6A8A84" opacity="0.8"/><path d="M9.2 1c-.5 1.4-1.8 2.4-3 2.4C6 1.9 7.4.5 9.2 1Z" fill="#6A8A84"/></svg>
            Apple
          </div>
        </div>
      </div>

      <!-- REGISTER -->
      <div class="form" [ngClass]="mode === 'register' ? 'visible' : 'right'">
        <div class="name-row">
          <div class="field"><div class="field-label">First name</div><input class="fi" placeholder="Buse"/></div>
          <div class="field"><div class="field-label">Last name</div><input class="fi" placeholder="U."/></div>
        </div>
        <div class="field"><div class="field-label">Email</div><input class="fi" placeholder="you@example.com" type="email"/></div>
        <div class="field">
          <div class="field-label">Password</div>
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
        <div class="terms">
          By signing up you agree to our <a>Terms of Service</a> and <a>Privacy Policy</a>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .scene{
      background:#080808; font-family:'Plus Jakarta Sans',sans-serif;
      color:var(--text); overflow:hidden;
      min-height:100vh; display:flex; align-items:center; justify-content:center;
      position:relative; margin:-32px;
    }
    .bg-glow-1{position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:600px;height:500px;background:radial-gradient(ellipse,rgba(62,207,178,0.07) 0%,transparent 60%);pointer-events:none;}
    .bg-glow-2{position:absolute;bottom:-80px;left:20%;width:300px;height:300px;background:radial-gradient(circle,rgba(62,207,178,0.04) 0%,transparent 65%);pointer-events:none;}
    .bg-glow-3{position:absolute;bottom:-60px;right:15%;width:250px;height:250px;background:radial-gradient(circle,rgba(107,168,200,0.03) 0%,transparent 65%);pointer-events:none;}
    .bg-grid{
      position:absolute;inset:0;
      background-image:linear-gradient(rgba(62,207,178,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(62,207,178,0.025) 1px,transparent 1px);
      background-size:48px 48px; pointer-events:none;
      mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 100%);
      -webkit-mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 0%,transparent 100%);
    }
    .card{
      width:420px; background:rgba(12,12,12,0.9); border:1px solid var(--border2); border-radius:20px;
      padding:36px; position:relative; z-index:2; backdrop-filter:blur(24px);
      box-shadow:0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(62,207,178,0.04);
      animation:card-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
    }
    @keyframes card-in{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
    .card::before{
      content:'';position:absolute;top:0;left:20%;right:20%;height:1px;
      background:linear-gradient(90deg,transparent,rgba(62,207,178,0.4),transparent);
    }
    .card-logo{
      font-family:'Playfair Display',serif;font-style:italic; font-size:24px;color:var(--text);
      display:flex;align-items:center;gap:12px; margin-bottom:28px;
    }
    .toggle-wrap{display:flex;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:30px;padding:4px;position:relative;margin-bottom:28px;}
    .toggle-bg{
      position:absolute;top:4px;bottom:4px;border-radius:24px;background:var(--teal-dim);
      border:1px solid rgba(62,207,178,0.2); transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1); z-index:0;
      box-shadow:0 0 12px rgba(62,207,178,0.08);
    }
    .t-opt{
      flex:1;text-align:center;padding:9px 0;border-radius:24px;font-size:13px;font-weight:500;
      cursor:pointer;position:relative;z-index:1;transition:color 0.3s;
    }
    .t-opt.active{color:var(--teal2);} .t-opt:not(.active){color:var(--text3);} .t-opt:not(.active):hover{color:var(--text2);}
    .headline-wrap{overflow:hidden;height:62px;margin-bottom:22px;position:relative;}
    .headline{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;transition:all 0.45s cubic-bezier(0.4,0,0.2,1);}
    .headline.visible{transform:translateY(0);opacity:1;}
    .headline.up{transform:translateY(-110%);opacity:0;}
    .headline.down{transform:translateY(110%);opacity:0;}
    .hl-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:400;color:var(--text);line-height:1.1;}
    .hl-title em{font-style:italic;color:var(--teal2);}
    .hl-sub{font-size:12px;color:var(--text2);margin-top:5px;font-weight:300;}
    .form-outer{position:relative;min-height:300px;}
    .form{display:flex;flex-direction:column;gap:13px;transition:all 0.4s cubic-bezier(0.4,0,0.2,1);}
    .form.visible{opacity:1;transform:translateX(0);position:relative;z-index:2;}
    .form.right{opacity:0;transform:translateX(32px);position:absolute;inset:0;pointer-events:none;}
    .form.left{opacity:0;transform:translateX(-32px);position:absolute;inset:0;pointer-events:none;}
    .field{display:flex;flex-direction:column;gap:5px;}
    .field-label{font-size:11px;color:var(--text2);}
    .fi{
      background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:9px;padding:11px 14px;
      font-size:13px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;outline:none;
      transition:all 0.2s;
    }
    .fi:focus{border-color:rgba(62,207,178,0.3);background:rgba(62,207,178,0.02);box-shadow:0 0 0 3px rgba(62,207,178,0.05);}
    .name-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
    .forgot{font-size:11px;color:var(--text3);cursor:pointer;text-align:right;margin-top:-4px;transition:color 0.15s;}
    .forgot:hover{color:var(--teal2);}
    .pw-bars{display:flex;gap:3px;margin-top:4px;}
    .pw-bar{flex:1;height:2px;border-radius:2px;background:rgba(255,255,255,0.05);transition:background 0.3s;}
    .submit{
      width:100%;padding:13px 0;border-radius:24px;background:var(--teal);color:#080808;font-size:13px;font-weight:600;
      cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;border:none;transition:all 0.2s;margin-top:2px;
      display:flex;align-items:center;justify-content:center;
    }
    .submit:hover{background:var(--teal2);transform:translateY(-1px);box-shadow:0 8px 24px rgba(62,207,178,0.22);}
    .submit:active{transform:scale(0.98);}
    .submit:disabled{opacity:0.7; pointer-events:none;}
    .div-row{display:flex;align-items:center;gap:10px;}
    .div-line{flex:1;height:1px;background:var(--border);}
    .div-text{font-size:11px;color:var(--text3);}
    .social-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
    .soc-btn{
      padding:10px 0;border-radius:9px;background:var(--glass);border:1px solid var(--border);
      color:var(--text2);font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;
    }
    .soc-btn:hover{background:var(--glass2);color:var(--text);border-color:var(--border2);}
    .terms{font-size:10.5px;color:var(--text3);text-align:center;line-height:1.6;}
    .terms a{color:var(--text2);cursor:pointer;}
    .spin{animation:spin 1s linear infinite;display:inline-block;}
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
    
    // Simulate slight network delay for effect
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

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-consumer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-head">
      <div>
        <div class="page-title">Available Products</div>
        <div class="page-sub">Explore the catalog</div>
      </div>
    </div>
    <div class="app-content" style="padding:0; display:flex; flex-direction:column; height: calc(100vh - 140px);">
      
      <!-- SEARCH BAR -->
      <div class="search-wrap">
        <div class="search-box">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#3ECFB2" stroke-width="1.2"/><path d="M10 10l2.5 2.5" stroke="#3ECFB2" stroke-width="1.2" stroke-linecap="round"/></svg>
          <input id="search-input" placeholder="Search 50,000+ products..." [(ngModel)]="searchQuery"/>
          <div class="search-count" id="search-count">{{filteredProducts.length}} results</div>
        </div>
        <div class="filter-toggle-btn" [class.active]="filtersOpen" (click)="filtersOpen = !filtersOpen">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 3.5h10M3.5 6.5h6M5.5 9.5h2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          Filters
          <div id="filter-badge" [class.show]="activeFilters.length > 0">{{activeFilters.length}}</div>
        </div>
      </div>

      <!-- ACTIVE FILTER CHIPS -->
      <div class="active-filters" [class.show]="activeFilters.length > 0">
        <div class="af-chip" *ngFor="let f of activeFilters">{{f}} <span class="af-x" (click)="removeFilter(f)">×</span></div>
        <div class="af-clear" *ngIf="activeFilters.length > 1" (click)="clearAll()">Clear all</div>
      </div>

      <div class="body" style="flex:1; overflow:hidden;">

        <!-- FILTER PANEL -->
        <div class="filter-panel" [class.collapsed]="!filtersOpen" style="overflow-y:auto;">
          <div class="fp-inner">
            <div class="fs">
              <div class="fs-head" (click)="catOpen = !catOpen">
                <div class="fs-title">Category</div>
                <div class="fs-arrow" [class.open]="catOpen">▾</div>
              </div>
              <div class="fs-body" [class.closed]="!catOpen">
                 <div class="fcheck" *ngFor="let c of categories" [class.checked]="c.checked" (click)="toggleFilter(c)">
                   <div class="fcheck-box"><svg *ngIf="c.checked" width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#3ECFB2" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                   <span class="fcheck-label">{{c.name}}</span>
                 </div>
              </div>
            </div>

            <div class="fs">
              <div class="fs-head" (click)="priceOpen = !priceOpen">
                <div class="fs-title">Price Range</div>
                <div class="fs-arrow" [class.open]="priceOpen">▾</div>
              </div>
              <div class="fs-body" [class.closed]="!priceOpen">
                <div class="price-inputs">
                  <input class="price-input" [value]="0" readonly/>
                  <div class="price-sep">—</div>
                  <input class="price-input" [(ngModel)]="maxPrice" />
                </div>
                <div class="range-wrap">
                  <div class="range-track"><div class="range-fill" [style.right]="(100 - (maxPrice/2000)*100) + '%'"></div></div>
                  <input type="range" min="0" max="2000" [(ngModel)]="maxPrice"/>
                </div>
              </div>
            </div>
            
            <div class="fs">
              <div class="fs-head" (click)="ratingOpen = !ratingOpen">
                <div class="fs-title">Rating</div>
                <div class="fs-arrow" [class.open]="ratingOpen">▾</div>
              </div>
              <div class="fs-body" [class.closed]="!ratingOpen">
                <div class="rating-opts">
                  <div class="rating-opt" [class.sel]="minRating === 4" (click)="minRating = 4">
                    <div class="stars-mini"><span class="sm-star fill">★</span><span class="sm-star fill">★</span><span class="sm-star fill">★</span><span class="sm-star fill">★</span><span class="sm-star">★</span></div>
                    <span class="rating-label">4+ stars</span>
                  </div>
                  <div class="rating-opt" [class.sel]="minRating === 0" (click)="minRating = 0">
                    <div class="stars-mini"><span class="sm-star fill">★</span><span class="sm-star fill">★</span><span class="sm-star fill">★</span><span class="sm-star fill">★</span><span class="sm-star fill">★</span></div>
                    <span class="rating-label">Any</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PRODUCTS GRID -->
        <div class="products-area" style="background:var(--bg);">
          <div class="sort-row">
            <div class="results-label"><span>{{filteredProducts.length}}</span> products found</div>
            <div class="sort-select">
              Sort: Featured
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="#6A8A84" stroke-width="1.1" stroke-linecap="round"/></svg>
            </div>
          </div>

          <div class="prod-grid" *ngIf="filteredProducts.length > 0">
            <div class="prod-card" *ngFor="let p of filteredProducts" [routerLink]="['/product', p.productId]">
              <div class="pc-img">
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none"><rect x="5" y="12" width="42" height="26" rx="3.5" stroke="#3ECFB2" stroke-width="1.2" opacity="0.5"/><rect x="19" y="38" width="14" height="3" rx="1.5" fill="rgba(62,207,178,0.2)"/><rect x="9" y="16" width="34" height="18" rx="2" fill="rgba(62,207,178,0.04)"/></svg>
                <div class="pc-badge badge-new" *ngIf="p.stockQuantity > 50">New</div>
              </div>
              <div class="pc-body">
                <div class="pc-cat">{{p.category}}</div>
                <div class="pc-name">{{p.name}}</div>
                <div class="pc-bottom">
                  <div class="pc-price">{{p.basePrice | currency}}</div>
                  <div class="pc-stars">
                     <button (click)="$event.stopPropagation(); checkSentiment(p)" class="ripple-btn ghost" style="padding:2px 6px; font-size:9px; border-radius:4px; margin-right:4px;">AI Vibe</button>
                     <span class="pc-star">★</span> 4.9
                  </div>
                </div>
                <div *ngIf="sentiments[p.productId]" style="margin-top:8px; font-size:10px;" class="spill" [class.p-g]="sentiments[p.productId].averageScore > 0.5" [class.p-w]="sentiments[p.productId].averageScore <= 0.5">
                   ● {{sentiments[p.productId].sentimentLabel}}
                </div>
              </div>
            </div>
          </div>

          <div class="no-results" *ngIf="filteredProducts.length === 0">
            <div class="nr-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="6.5" stroke="#344844" stroke-width="1.3"/><path d="M13.5 13.5l4 4" stroke="#344844" stroke-width="1.3" stroke-linecap="round"/></svg></div>
            <div class="nr-title">No results found</div>
            <div class="nr-sub">Try adjusting your filters or search term.</div>
          </div>
        </div>

        <!-- AI ASSISTANT PANEL -->
        <div class="ai-panel" style="width:320px; border-left:1px solid var(--border); display:flex; flex-direction:column; background:rgba(8,8,8,0.4);">
          <div class="gc-head" style="padding:16px 20px; border-bottom:1px solid var(--border);">
            <div class="gc-title">AI Shopping Assistant <span style="font-size:9px;color:var(--green);margin-left:8px;font-weight:400;">● online</span></div>
          </div>
          <div class="chat-msgs" style="flex:1; overflow-y:auto; padding:20px;">
            <div *ngFor="let msg of chatMessages" class="cmsg" [class.r]="msg.sender === 'user'">
              <div class="cav">{{msg.sender === 'user' ? 'ME' : 'AI'}}</div>
              <div class="cbub">{{msg.text}}</div>
            </div>
          </div>
          <div class="chat-ft" style="padding:16px 20px; border-top:1px solid var(--border);">
            <input [(ngModel)]="prompt" (keyup.enter)="sendQuery()" class="cinput" placeholder="Ask about products...">
            <div class="csend" (click)="sendQuery()" style="display:flex; align-items:center;">Send →</div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class ConsumerComponent implements OnInit {
  products: any[] = [];
  sentiments: any = {};
  prompt = '';
  chatMessages: any[] = [{ sender: 'ai', text: 'Welcome to Nexus Store! Tell me what you are looking for today.' }];
  history: string[] = [];

  // PLP State
  searchQuery = '';
  filtersOpen = true;
  maxPrice = 1500;
  minRating = 0;
  catOpen = true;
  priceOpen = true;
  ratingOpen = true;

  categories = [
    { name: 'Hardware', checked: false },
    { name: 'Accessories', checked: false },
    { name: 'Software', checked: false },
    { name: 'Electronics', checked: false }
  ];

  auth = inject(AuthService);
  ai = inject(AiService);
  productService = inject(ProductService);

  ngOnInit() {
    this.productService.getProducts().subscribe(res => {
      this.products = res;
      // Pre-populate some dummy categories if backend doesn't have them yet
      const cats = Array.from(new Set(this.products.map(p => p.category)));
      this.categories = cats.map((c: any) => ({ name: c, checked: false }));
    });
  }

  get activeFilters() {
    return this.categories.filter(c => c.checked).map(c => c.name);
  }

  get filteredProducts() {
    let list = this.products;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    list = list.filter(p => p.basePrice <= this.maxPrice);
    const selCats = this.activeFilters;
    if (selCats.length > 0) {
      list = list.filter(p => selCats.includes(p.category));
    }
    return list;
  }

  toggleFilter(c: any) {
    c.checked = !c.checked;
  }

  removeFilter(name: string) {
    const c = this.categories.find(x => x.name === name);
    if(c) c.checked = false;
  }

  clearAll() {
    this.categories.forEach(c => c.checked = false);
  }

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

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.ai.query(userMsg, user.userId || 1, user.role, this.history).subscribe(res => {
      this.chatMessages.push({ sender: 'ai', text: res.response });
      this.history.push(`User: ${userMsg}`, `AI: ${res.response}`);
    });
  }
}

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-head" style="display:flex;justify-content:space-between;">
      <div>
        <div class="page-title">Store Operations</div>
        <div class="page-sub">Management Panel</div>
      </div>
      <div class="head-r">
        <div class="admin-badge" style="background:var(--blue-dim); color:var(--blue); border-color:var(--blue-dim);">Manager</div>
      </div>
    </div>
    <div class="app-content">
      <div class="kpi-row">
        <div class="kpi"><div class="kpi-label">Your Products</div><div class="kpi-val">{{products.length}}</div><div class="kpi-delta up">↑ Active</div></div>
        <div class="kpi"><div class="kpi-label">Store Rating</div><div class="kpi-val">4.8★</div><div class="kpi-delta up">Excellent</div></div>
        <div class="kpi"><div class="kpi-label">Low Stock</div><div class="kpi-val">3</div><div class="kpi-delta dn">Action needed</div></div>
        <div class="kpi"><div class="kpi-label">Today's Sales</div><div class="kpi-val">$2,840</div><div class="kpi-delta up">↑ 8%</div></div>
      </div>
      <div class="table-card" style="background:var(--glass); border:1px solid var(--border); border-radius:10px; overflow:hidden;">
        <div class="gc-head" style="padding:15px; border-bottom:1px solid var(--border);"><div class="gc-title">Inventory Overview</div></div>
        <table class="tbl">
          <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead>
          <tbody>
            <tr *ngFor="let p of products">
              <td class="td-name">{{p.name}}</td>
              <td>{{p.category}}</td>
              <td style="font-family:'JetBrains Mono',monospace;">{{p.basePrice | currency}}</td>
              <td><span class="spill" [class.sp-green]="p.stockQuantity > 10" [class.sp-amber]="p.stockQuantity <= 10">● {{p.stockQuantity}}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ManagerComponent implements OnInit {
  products: any[] = [];
  productService = inject(ProductService);
  ngOnInit() {
    this.productService.getProducts().subscribe(res => this.products = res);
  }
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="body" style="display:flex; height:calc(100vh - 84px);">
      <!-- SIDEBAR -->
      <div class="sidebar-admin">
        <div class="sg-label">Overview</div>
        <div class="sitem-admin" [class.active]="tab === 'dashboard'" (click)="tab = 'dashboard'"><div style="display:flex;align-items:center;gap:8px;"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.6"/><rect x="7" y="1" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.4"/><rect x="1" y="7" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.4"/><rect x="7" y="7" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.3"/></svg>Dashboard</div></div>
        <div class="sitem-admin" [class.active]="tab === 'analytics'" (click)="tab = 'analytics'"><div style="display:flex;align-items:center;gap:8px;"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 10L4 6l3 2 5-6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>Analytics</div></div>
        
        <div class="sg-label">Management</div>
        <div class="sitem-admin" [class.active]="tab === 'stores'" (click)="tab = 'stores'"><div style="display:flex;align-items:center;gap:8px;"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 5.5h10v6a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-6Z" stroke="currentColor" stroke-width="1.1"/><path d="M.5 3l.8-1.5h10.4L12.5 3a2 2 0 0 1-2 2.5h-8A2 2 0 0 1 .5 3Z" stroke="currentColor" stroke-width="1.1"/></svg>Stores</div> <span class="sitem-badge green" style="background:var(--green-dim);color:var(--green);font-size:9px;padding:1px 6px;border-radius:8px;border:1px solid rgba(62,201,138,0.2);">4</span></div>
        <div class="sitem-admin" [class.active]="tab === 'users'" (click)="tab = 'users'"><div style="display:flex;align-items:center;gap:8px;"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.5" stroke="currentColor" stroke-width="1.1"/><path d="M1.5 11.5c0-2.7 2-4 5-4s5 1.3 5 4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Users</div></div>
        
        <div class="sg-label" style="margin-top:auto;">System</div>
        <div class="sitem-admin" [class.active]="tab === 'settings'" (click)="tab = 'settings'"><div style="display:flex;align-items:center;gap:8px;"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" stroke-width="1.1"/><path d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12M2.6 2.6l.85.85M9.55 9.55l.85.85M2.6 10.4l.85-.85M9.55 3.45l.85-.85" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Settings</div></div>
      </div>

      <!-- MAIN CONTENT -->
      <div class="main" style="flex:1; overflow-y:auto; padding:24px;">
        <!-- DASHBOARD TAB -->
        <div *ngIf="tab === 'dashboard'">
          <div class="top-bar">
            <div><div class="page-title">Dashboard</div><div class="page-sub">Friday, 17 April · Platform overview</div></div>
            <div class="top-actions" style="display:flex; gap:8px;">
              <button class="tbtn tbtn-ghost" style="background:var(--glass); border:1px solid var(--border2); color:var(--text2); padding:7px 14px; border-radius:20px; font-size:11.5px; cursor:pointer;">Export Report</button>
              <button class="tbtn tbtn-primary" style="background:var(--teal); color:#080808; border:none; padding:7px 14px; border-radius:20px; font-size:11.5px; font-weight:600; cursor:pointer;">+ Add Store</button>
            </div>
          </div>

          <div class="kpi-row">
            <div class="kpi"><div class="kpi-label">Platform Revenue</div><div class="kpi-val">$847K</div><div class="kpi-delta up" style="color:var(--green);">↑ 22.4% this month</div></div>
            <div class="kpi"><div class="kpi-label">Total Orders</div><div class="kpi-val">12,847</div><div class="kpi-delta up" style="color:var(--green);">↑ 14.2% this month</div></div>
            <div class="kpi"><div class="kpi-label">Active Stores</div><div class="kpi-val">4</div><div class="kpi-delta up" style="color:var(--green);">↑ 1 new this week</div></div>
            <div class="kpi"><div class="kpi-label">Total Users</div><div class="kpi-val">24,391</div><div class="kpi-delta up" style="color:var(--green);">↑ 8.7% this month</div></div>
          </div>

          <div class="chart-row">
            <div class="gcard" style="background:var(--glass); border:1px solid var(--border); border-radius:10px; overflow:hidden;">
              <div class="gc-head" style="padding:11px 15px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between;"><div class="gc-title" style="font-size:9.5px; text-transform:uppercase; color:var(--text2);">Revenue by Month</div></div>
              <div class="gc-body" style="padding:12px 15px;">
                <div class="bar-chart">
                  <div class="bc-col" *ngFor="let m of months; let i = index">
                    <div class="bc-bar" [class.active-bar]="i === 9" [style.height.%]="m.val"></div>
                    <div class="bc-label" [style.color]="i === 9 ? 'var(--teal2)' : 'var(--text3)'">{{m.label}}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="gcard" style="background:var(--glass); border:1px solid var(--border); border-radius:10px; overflow:hidden;">
               <div class="gc-head" style="padding:11px 15px; border-bottom:1px solid var(--border);"><div class="gc-title" style="font-size:9.5px; text-transform:uppercase; color:var(--text2);">Revenue Split</div></div>
               <div class="gc-body" style="padding:12px 15px; display:flex; flex-direction:column; gap:12px;">
                 <div class="dl-item"><div class="dl-dot" style="background:var(--teal); width:7px; height:7px; border-radius:50%;"></div> Electronics 44%</div>
                 <div class="dl-item"><div class="dl-dot" style="background:var(--blue); width:7px; height:7px; border-radius:50%;"></div> Accessories 20%</div>
                 <div class="dl-item"><div class="dl-dot" style="background:var(--amber); width:7px; height:7px; border-radius:50%;"></div> Peripherals 14%</div>
               </div>
            </div>
          </div>

          <div class="table-card" style="background:var(--glass); border:1px solid var(--border); border-radius:10px; overflow:hidden;">
            <div class="gc-head" style="padding:15px; border-bottom:1px solid var(--border);"><div class="gc-title">Recent Activity</div></div>
            <table class="tbl">
              <thead><tr><th>Order</th><th>Customer</th><th>Store</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td class="td-mono">#ORD-7821</td><td class="td-name">Buse Ü.</td><td>Nexus Main</td><td class="td-amt">$1,788</td><td><span class="spill sp-blue">● Shipped</span></td></tr>
                <tr><td class="td-mono">#ORD-7820</td><td class="td-name">James W.</td><td>TechHub</td><td class="td-amt">$284</td><td><span class="spill sp-green">● Delivered</span></td></tr>
                <tr><td class="td-mono">#ORD-7819</td><td class="td-name">Emily J.</td><td>Nexus Main</td><td class="td-amt">$432</td><td><span class="spill sp-amber">● Pending</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- STORES TAB -->
        <div *ngIf="tab === 'stores'">
          <div class="top-bar"><div><div class="page-title">Store Management</div><div class="page-sub">Approve, open or close stores.</div></div></div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="gcard" style="padding:16px; background:var(--glass); border:1px solid var(--border); border-radius:12px;" *ngFor="let s of stores">
              <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                <div><div class="td-name" style="font-size:14px;">{{s.name}}</div><div style="font-size:11px; color:var(--text3);">Owner: {{s.owner}}</div></div>
                <div class="spill sp-green">Open</div>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
                <div style="text-align:center;"><div style="font-size:14px; color:var(--text);">{{s.rev}}</div><div style="font-size:9px; color:var(--text3); text-transform:uppercase;">Revenue</div></div>
                <div style="text-align:center;"><div style="font-size:14px; color:var(--text);">{{s.orders}}</div><div style="font-size:9px; color:var(--text3); text-transform:uppercase;">Orders</div></div>
                <div style="text-align:center;"><div style="font-size:14px; color:var(--text);">{{s.rating}}★</div><div style="font-size:9px; color:var(--text3); text-transform:uppercase;">Rating</div></div>
              </div>
              <div style="display:flex; gap:8px;">
                <button class="tbtn tbtn-ghost" style="flex:1; border:1px solid var(--border); background:var(--glass); color:var(--text2); padding:6px; border-radius:20px; font-size:11px;">View</button>
                <button class="tbtn tbtn-ghost" style="flex:1; border:1px solid var(--red-border); background:var(--glass); color:var(--red); padding:6px; border-radius:20px; font-size:11px;">Close</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminComponent {
  tab = 'dashboard';
  months = [
    {label:'J', val:35}, {label:'F', val:52}, {label:'M', val:44}, {label:'A', val:68},
    {label:'M', val:55}, {label:'J', val:72}, {label:'J', val:61}, {label:'A', val:80},
    {label:'S', val:65}, {label:'O', val:100}, {label:'N', val:74}, {label:'D', val:30}
  ];
  stores = [
    { name: 'Nexus Main Store', owner: 'Admin', rev: '$427K', orders: '6,421', rating: '4.9' },
    { name: 'TechHub Store', owner: 'James W.', rev: '$218K', orders: '3,104', rating: '4.7' },
    { name: 'GadgetPro', owner: 'Sara M.', rev: '$142K', orders: '2,089', rating: '4.8' },
    { name: 'ByteShop', owner: 'Pending', rev: '$60K', orders: '1,233', rating: '4.5' }
  ];
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="body" style="display:flex; height:calc(100vh - 84px);">
      <!-- SIDEBAR -->
      <div class="sidebar" style="width:200px; border-right:1px solid var(--border); padding:20px 10px; display:flex; flex-direction:column; gap:4px;">
        <div class="sidebar-title">Account</div>
        <div class="sitem" [class.active]="tab === 'personal'" (click)="tab = 'personal'">Personal Info</div>
        <div class="sitem" [class.active]="tab === 'password'" (click)="tab = 'password'">Password</div>
        
        <div class="sidebar-title">Preferences</div>
        <div class="sitem" [class.active]="tab === 'notifs'" (click)="tab = 'notifs'">Notifications</div>
        <div class="sitem" [class.active]="tab === 'privacy'" (click)="tab = 'privacy'">Privacy</div>
        
        <div class="danger-item" (click)="tab = 'danger'" style="margin-top:auto; color:var(--red); font-size:12px; cursor:pointer; padding:10px;">
          Danger Zone
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <div class="main" style="flex:1; padding:24px; overflow-y:auto;">
        
        <!-- PERSONAL INFO -->
        <div *ngIf="tab === 'personal'">
          <div class="sec-head" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; border-bottom:1px solid var(--border); padding-bottom:16px;">
            <div><div class="sec-title">Personal Info</div><div class="sec-sub">Update your profile details.</div></div>
            <button class="save-btn" style="background:var(--teal); color:#080808; padding:10px 24px; border-radius:22px; border:none; font-weight:600; cursor:pointer;">Save Changes</button>
          </div>

          <div class="avatar-section-nexus">
            <div class="av-circle-nexus">B</div>
            <div class="av-info">
              <div class="av-name" style="font-size:16px; font-weight:500;">Buse Ünal</div>
              <div class="av-email" style="font-size:12px; color:var(--text3);">buse@akdeniz.edu.tr</div>
            </div>
            <button class="tbtn tbtn-ghost" style="background:var(--glass); border:1px solid var(--border2); color:var(--text2); padding:6px 12px; border-radius:20px; font-size:11px;">Change Photo</button>
          </div>

          <div class="form-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div class="field"><div class="fl" style="font-size:11px; color:var(--text2); margin-bottom:4px;">First Name</div><input class="fi" value="Buse"/></div>
            <div class="field"><div class="fl" style="font-size:11px; color:var(--text2); margin-bottom:4px;">Last Name</div><input class="fi" value="Ünal"/></div>
            <div class="field"><div class="fl" style="font-size:11px; color:var(--text2); margin-bottom:4px;">Email</div><input class="fi" value="buse@akdeniz.edu.tr"/></div>
            <div class="field"><div class="fl" style="font-size:11px; color:var(--text2); margin-bottom:4px;">Phone</div><input class="fi" value="+90 555 123 45 67"/></div>
          </div>
        </div>

        <!-- NOTIFICATIONS -->
        <div *ngIf="tab === 'notifs'">
          <div class="sec-head" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; border-bottom:1px solid var(--border); padding-bottom:16px;">
            <div><div class="sec-title">Notifications</div><div class="sec-sub">Manage your alerts.</div></div>
          </div>
          <div class="notif-list" style="display:flex; flex-direction:column; gap:1px; border:1px solid var(--border); border-radius:12px; overflow:hidden;">
            <div class="notif-row-nexus" *ngFor="let n of notifs">
              <div class="notif-body" style="flex:1;">
                <div class="notif-title" style="font-size:13px; font-weight:500;">{{n.title}}</div>
                <div class="notif-desc" style="font-size:11px; color:var(--text3);">{{n.desc}}</div>
              </div>
              <div class="tog-nexus" [class.on]="n.on" [class.off]="!n.on" (click)="n.on = !n.on">
                <div class="tog-nexus-thumb"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- DANGER ZONE -->
        <div *ngIf="tab === 'danger'">
          <div class="sec-head" style="margin-bottom:24px; border-bottom:1px solid var(--border); padding-bottom:16px;">
            <div><div class="sec-title" style="color:var(--red);">Danger Zone</div><div class="sec-sub">Irreversible actions.</div></div>
          </div>
          <div class="danger-zone-nexus">
            <div style="font-size:13px; font-weight:600; color:var(--red); margin-bottom:8px;">Deactivate Account</div>
            <p style="font-size:12px; color:var(--text2); line-height:1.6; margin-bottom:16px;">Temporarily disable your account. You can reactivate anytime by logging back in.</p>
            <button class="tbtn tbtn-ghost" style="border-color:var(--red-border); color:var(--red); padding:8px 16px; border-radius:20px; cursor:pointer;">Deactivate</button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class SettingsComponent {
  tab = 'personal';
  notifs = [
    { title: 'Order Confirmations', desc: 'When an order is placed', on: true },
    { title: 'Shipping Updates', desc: 'Real-time tracking alerts', on: true },
    { title: 'Deals & Offers', desc: 'Personalized sale alerts', on: false }
  ];
}
