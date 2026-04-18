import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
          <div class="search-count">{{filteredProducts.length}} results</div>
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

      <div class="con-body" style="flex:1; overflow:hidden; display:flex; width:100%;">

        <!-- FILTER PANEL -->
        <div class="con-sidebar filter-panel" [class.collapsed]="!filtersOpen" style="overflow-y:auto; width:260px; border-right:1px solid var(--border);">
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
        <div class="products-area" style="background:var(--bg); flex:1;">
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
                <img *ngIf="p.imageUrl" [src]="p.imageUrl" [alt]="p.name" style="width:100%; height:100%; object-fit:cover; border-radius:12px;"/>
                <svg *ngIf="!p.imageUrl" width="52" height="52" viewBox="0 0 52 52" fill="none"><rect x="5" y="12" width="42" height="26" rx="3.5" stroke="#3ECFB2" stroke-width="1.2" opacity="0.5"/><rect x="19" y="38" width="14" height="3" rx="1.5" fill="rgba(62,207,178,0.2)"/><rect x="9" y="16" width="34" height="18" rx="2" fill="rgba(62,207,178,0.04)"/></svg>
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

  categories: {name: string, checked: boolean}[] = [];

  auth = inject(AuthService);
  ai = inject(AiService);
  productService = inject(ProductService);

  ngOnInit() {
    this.productService.getProducts().subscribe(res => {
      this.products = res;
      const cats = Array.from(new Set(this.products.map(p => p.category)));
      this.categories = cats.map((c: any) => ({ name: c, checked: false }));
    });
  }

  get activeFilters() {
    return this.categories.filter(c => c.checked).map(c => c.name);
  }

  get filteredProducts() {
    let list = this.products || [];
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
  auth = inject(AuthService);
  ngOnInit() {
    this.productService.getProducts().subscribe(res => this.products = res);
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
          <div class="nav-av-nexus">A</div>
        </div>
      </div>

      <div class="body-frame">
        <!-- SIDEBAR -->
        <div class="sidebar-nexus">
          <div class="sg-label-admin">Overview</div>
          <div class="sitem-nexus" [class.active]="tab === 'dashboard'" (click)="tab = 'dashboard'">
            <div class="sitem-l-nexus"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.6"/><rect x="7" y="1" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.4"/><rect x="1" y="7" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.4"/><rect x="7" y="7" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.3"/></svg>Dashboard</div>
          </div>
          <div class="sitem-nexus" [class.active]="tab === 'analytics'" (click)="tab = 'analytics'">
            <div class="sitem-l-nexus"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 10L4 6l3 2 5-6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>Analytics</div>
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
            <div class="sitem-l-nexus"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" stroke-width="1.1"/><path d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12M2.6 2.6l.85.85M9.55 9.55l.85.85M2.6 10.4l.85-.85M9.55 3.45l.85-.85" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>Settings</div>
          </div>

          <div class="sidebar-foot-nexus">
            <div class="s-user-nexus">
              <div class="nav-av-nexus" style="width:26px;height:26px;font-size:10px;flex-shrink:0;">A</div>
              <div><div class="su-name-nexus">Admin</div><div class="su-role-nexus">Super Admin</div></div>
            </div>
          </div>
        </div>

        <div class="main-nexus">
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
              <div class="kpi-nexus"><div class="kpi-label-nexus">Platform Revenue</div><div class="kpi-val-nexus">$847K</div><div class="kpi-delta-nexus up">↑ 22.4% this month</div></div>
              <div class="kpi-nexus"><div class="kpi-label-nexus">Total Orders</div><div class="kpi-val-nexus">12,847</div><div class="kpi-delta-nexus up">↑ 14.2% this month</div></div>
              <div class="kpi-nexus"><div class="kpi-label-nexus">Active Stores</div><div class="kpi-val-nexus">{{stores.length}}</div><div class="kpi-delta-nexus up">↑ 1 new this week</div></div>
              <div class="kpi-nexus"><div class="kpi-label-nexus">Total Users</div><div class="kpi-val-nexus">24,391</div><div class="kpi-delta-nexus up">↑ 8.7% this month</div></div>
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
                  <div><div class="sc-name-nexus">{{s.name}}</div><div class="sc-owner-nexus">Owner: {{s.owner}}</div></div>
                  <div class="sc-status-nexus sc-open"><div class="sc-dot-nexus green"></div>Open</div>
                </div>
                <div class="sc-stats-nexus">
                  <div class="sc-stat-nexus"><div class="sc-stat-val-nexus">{{s.rev}}</div><div class="sc-stat-label-nexus">Revenue</div></div>
                  <div class="sc-stat-nexus"><div class="sc-stat-val-nexus">{{s.orders}}</div><div class="sc-stat-label-nexus">Orders</div></div>
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
                    <td class="td-name-nexus">{{u.name}}</td>
                    <td>{{u.email}}</td>
                    <td><span class="spill-nexus sp-blue">{{u.role}}</span></td>
                    <td><span class="spill-nexus sp-green">Active</span></td>
                    <td>
                      <div style="display:flex; gap:6px;">
                        <button class="sc-btn-nexus" style="padding:2px 8px; border-radius:8px;">Edit</button>
                        <button class="sc-btn-nexus danger" style="padding:2px 8px; border-radius:8px;">Ban</button>
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
            <div class="top-bar-nexus"><div><div class="page-title-nexus">System Settings</div><div class="page-sub-nexus">Platform configuration.</div></div></div>
            <div style="max-width:480px; display:flex; flex-direction:column; gap:12px;">
              <div class="gcard-nexus" style="padding:16px;">
                <div class="gc-title-nexus" style="margin-bottom:12px;">Platform Controls</div>
                <div style="display:flex; flex-direction:column; gap:12px;">
                  <div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-size:13px; color:var(--text2);">Maintenance Mode</span><div class="tog-nexus-mini off"></div></div>
                  <div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-size:13px; color:var(--text2);">New Registrations</span><div class="tog-nexus-mini on"></div></div>
                  <div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-size:13px; color:var(--text2);">AI Shopping Assistant</span><div class="tog-nexus-mini on"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-frame{background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--text);display:flex;flex-direction:column;height:calc(100vh - 20px); overflow:hidden;}
    
    .navbar-nexus{display:flex;align-items:center;justify-content:space-between;padding:12px 22px;border-bottom:1px solid var(--border);background:rgba(8,8,8,0.95);backdrop-filter:blur(20px);flex-shrink:0;z-index:20;}
    .logo-admin{font-family:'Playfair Display',serif;font-style:italic;font-size:18px;color:var(--text);display:flex;align-items:center;gap:7px;}
    .logo-dot-admin{width:6px;height:6px;border-radius:50%;background:var(--teal);box-shadow:0 0 6px var(--teal-glow);}
    .admin-badge-nexus{background:var(--red-dim);border:1px solid var(--red-border);color:var(--red);font-size:9px;padding:2px 8px;border-radius:8px;letter-spacing:0.06em;text-transform:uppercase;}
    .nav-r-nexus{display:flex;align-items:center;gap:10px;}
    .nav-notif-nexus{width:32px;height:32px;border-radius:50%;background:var(--glass);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;}
    .notif-dot-nexus{position:absolute;top:-1px;right:-1px;width:8px;height:8px;border-radius:50%;background:var(--red);border:1.5px solid var(--bg);}
    .nav-av-nexus{width:30px;height:30px;border-radius:50%;background:var(--teal-dim);border:1px solid rgba(62,207,178,0.25);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:var(--teal);}

    .body-frame{display:flex;flex:1;overflow:hidden;}
    .sidebar-nexus{width:200px;min-width:200px;border-right:1px solid var(--border);display:flex;flex-direction:column;padding:14px 10px;background:rgba(8,8,8,0.6);}
    .sg-label-admin{font-size:8.5px;letter-spacing:0.14em;text-transform:uppercase;color:var(--text3);padding:0 10px;margin-bottom:5px;margin-top:14px;}
    .sitem-nexus{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:20px;font-size:12.5px;color:var(--text2);cursor:pointer;transition:all 0.15s;margin-bottom:1px;justify-content:space-between;}
    .sitem-nexus.active{background:var(--teal-dim);color:var(--teal2);border:1px solid rgba(62,207,178,0.18);}
    .sitem-nexus:not(.active):hover{background:var(--glass2);color:var(--text);}
    .sitem-l-nexus{display:flex;align-items:center;gap:8px;}
    .sitem-badge-nexus{font-size:9px;padding:1px 6px;border-radius:8px;background:var(--red-dim);color:var(--red);border:1px solid var(--red-border);}
    .sitem-badge-nexus.green{background:var(--green-dim);color:var(--green);border-color:rgba(62,201,138,0.2);}
    .sidebar-foot-nexus{margin-top:auto;padding-top:10px;border-top:1px solid var(--border);}
    .s-user-nexus{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:20px;background:var(--glass);border:1px solid var(--border);}
    .su-name-nexus{font-size:11.5px;color:var(--text);font-weight:500;}
    .su-role-nexus{font-size:9px;color:var(--text3);}

    .main-nexus{flex:1;overflow-y:auto;background:transparent; padding:20px;}
    .panel-nexus{display:block; animation:fadein 0.4s ease forwards;}
    @keyframes fadein{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}

    .top-bar-nexus{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:16px;}
    .page-title-nexus{font-family:'Playfair Display',serif;font-size:20px;font-style:italic;color:var(--text);}
    .page-sub-nexus{font-size:11px;color:var(--text3);margin-top:3px;}
    .tbtn-nexus{padding:7px 14px;border-radius:20px;font-size:11.5px;cursor:pointer;font-family:inherit;transition:all 0.15s; border:none;}
    .tbtn-nexus.ghost{background:var(--glass);border:1px solid var(--border2);color:var(--text2);}
    .tbtn-nexus.primary{background:var(--teal);color:#080808;font-weight:600;}

    .kpi-row-nexus{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;}
    .kpi-nexus{background:var(--glass);border:1px solid var(--border);border-radius:10px;padding:13px 15px;position:relative;overflow:hidden;}
    .kpi-label-nexus{font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text3);margin-bottom:6px;}
    .kpi-val-nexus{font-family:'Playfair Display',serif;font-size:22px;color:var(--text);line-height:1;margin-bottom:5px;}
    .kpi-delta-nexus{font-size:10px;display:flex;align-items:center;gap:3px;}
    .up{color:var(--green);}

    .chart-row-nexus{display:grid;grid-template-columns:1fr 240px;gap:10px;margin-bottom:10px;}
    .gcard-nexus{background:var(--glass);border:1px solid var(--border);border-radius:10px;overflow:hidden;}
    .gc-head-nexus{padding:11px 15px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between; height:40px;}
    .gc-title-nexus{font-size:9.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text2);}
    .gc-link-nexus{font-size:10px;color:var(--text3);cursor:pointer;}
    .gc-body-nexus{padding:12px 15px;}

    .bar-chart-nexus{display:flex;align-items:flex-end;gap:5px;height:80px;}
    .bc-col-nexus{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;}
    .bc-bar-nexus{width:100%;border-radius:3px 3px 0 0;background:rgba(62,207,178,0.1);transition:all 0.3s;cursor:pointer;}
    .bc-bar-nexus.active-bar{background:rgba(62,207,178,0.4);}
    .bc-label-nexus{font-size:8px;color:var(--text3);font-family:'JetBrains Mono',monospace;}

    .donut-wrap-nexus{display:flex;align-items:center;gap:12px;}
    .donut-legend-nexus{display:flex;flex-direction:column;gap:7px;}
    .dl-item-nexus{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--text2);}
    .dl-dot-nexus{width:7px;height:7px;border-radius:50%;}

    .table-card-nexus{background:var(--glass);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:10px;}
    .tbl-nexus{width:100%;border-collapse:collapse;}
    .tbl-nexus th{padding:8px 14px;font-size:8.5px;letter-spacing:0.11em;text-transform:uppercase;color:var(--text3);text-align:left;font-weight:400;border-bottom:1px solid var(--border);}
    .tbl-nexus td{padding:8px 14px;font-size:12px;color:var(--text2);border-bottom:1px solid rgba(255,255,255,0.03);}
    .td-name-nexus{color:var(--text);font-weight:500;}
    .td-mono-nexus{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--teal);opacity:0.8;}
    .td-amt-nexus{color:var(--text);font-weight:500;}
    .spill-nexus{display:inline-flex;align-items:center;gap:4px;font-size:10px;padding:2px 8px;border-radius:10px;font-weight:500;}
    .sp-green{background:var(--green-dim);color:var(--green);}
    .sp-blue{background:var(--blue-dim);color:var(--blue);}
    .sp-amber{background:var(--amber-dim);color:var(--amber);}
    .sp-red{background:var(--red-dim);color:var(--red);}

    .store-grid-nexus{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
    .store-card-nexus{background:var(--glass);border:1px solid var(--border);border-radius:10px;padding:14px 16px;}
    .sc-top-nexus{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;}
    .sc-name-nexus{font-size:13px;font-weight:500;color:var(--text);}
    .sc-owner-nexus{font-size:11px;color:var(--text3);}
    .sc-status-nexus{display:inline-flex;align-items:center;gap:4px;font-size:10px;padding:3px 9px;border-radius:10px;}
    .sc-open{background:var(--green-dim);color:var(--green);border:1px solid rgba(62,201,138,0.18);}
    .sc-stats-nexus{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px;}
    .sc-stat-nexus{text-align:center;}
    .sc-stat-val-nexus{font-size:14px;font-weight:500;color:var(--text);}
    .sc-stat-label-nexus{font-size:9px;color:var(--text3);text-transform:uppercase;}
    .sc-actions-nexus{display:flex;gap:6px;}
    .sc-btn-nexus{flex:1;padding:6px 0;border-radius:20px;font-size:11px;cursor:pointer;border:1px solid var(--border);background:var(--glass);color:var(--text2);}
    .sc-btn-nexus.danger{color:var(--red);border-color:var(--red-border);}
    .sc-dot-nexus{width:6px;height:6px;border-radius:50%;}
    .sc-dot-nexus.green{background:var(--green);box-shadow:0 0 4px var(--green);}
    
    .tog-nexus-mini{width:28px; height:16px; border-radius:10px; position:relative; cursor:pointer;}
    .tog-nexus-mini.on{background:var(--teal);}
    .tog-nexus-mini.off{background:rgba(255,255,255,0.1);}
    .tog-nexus-mini::after{content:''; position:absolute; top:2px; left:2px; width:12px; height:12px; border-radius:50%; background:#fff; transition:0.2s;}
    .tog-nexus-mini.on::after{left:14px;}
  `]
})
export class AdminComponent implements OnInit {
  tab = 'dashboard';
  auth = inject(AuthService);
  productService = inject(ProductService);
  
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

  users = [
    { name: 'Buse Ünal', email: 'buse@akdeniz.edu.tr', role: 'Super Admin' },
    { name: 'James Wilson', email: 'james@techhub.com', role: 'Store Owner' },
    { name: 'Sarah Miller', email: 'sarah@outlook.com', role: 'Consumer' }
  ];

  orders = [
    { id: '#ORD-7821', customer: 'Buse Ü.', store: 'Nexus Main', amount: '$1,788', status: 'Shipped', class: 'sp-blue' },
    { id: '#ORD-7820', customer: 'James W.', store: 'TechHub', amount: '$284', status: 'Delivered', class: 'sp-green' },
    { id: '#ORD-7819', customer: 'Emily J.', store: 'Nexus Main', amount: '$432', status: 'Pending', class: 'sp-amber' },
    { id: '#ORD-7818', customer: 'Ali K.', store: 'GadgetPro', amount: '$99', status: 'Delivered', class: 'sp-green' },
    { id: '#ORD-7817', customer: 'Sarah M.', store: 'TechHub', amount: '$2,241', status: 'Cancelled', class: 'sp-red' }
  ];

  pagedProducts: any[] = [];

  ngOnInit() {
    this.productService.getProducts().subscribe(res => this.pagedProducts = res);
  }
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="set-body" style="display:flex; height:calc(100vh - 64px); width:100%;">
      <div class="set-sidebar" style="width:200px; border-right:1px solid var(--border); padding:20px 10px; display:flex; flex-direction:column; gap:4px;">
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
      <div class="set-main" style="flex:1; padding:24px; overflow-y:auto;">
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
