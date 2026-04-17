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
    <div class="app-content">
      <div class="row2">
        <div class="gcard">
          <div class="gc-head"><div class="gc-title">Product List</div></div>
          <div class="gc-body" style="padding:0;">
             <table class="tbl">
                <thead><tr><th>Product</th><th>Price</th><th>Action</th><th>Sentiment</th></tr></thead>
                <tbody>
                  <tr *ngFor="let p of products">
                     <td class="nm"><span class="fancy-link" [routerLink]="['/product', p.productId]">{{p.name}}</span></td>
                     <td class="mono">{{p.basePrice | currency}}</td>
                     <td><button (click)="checkSentiment(p)" class="ripple-btn ghost" style="padding:4px 8px; font-size:9px; border-radius:12px;">Analyze Vibes 🧠</button></td>
                     <td>
                        <span *ngIf="sentiments[p.productId]" class="spill" [class.p-g]="sentiments[p.productId].averageScore > 0.5" [class.p-w]="sentiments[p.productId].averageScore <= 0.5">
                          ● {{sentiments[p.productId].sentimentLabel}}
                        </span>
                     </td>
                  </tr>
                  <tr *ngIf="products.length === 0">
                     <td colspan="4" style="text-align:center; padding: 2rem; color:var(--text3);">No products available. Database is empty.</td>
                  </tr>
                </tbody>
             </table>
          </div>
        </div>

        <div class="gcard" style="display:flex; flex-direction:column; height: 100%; min-height: 400px;">
          <div class="gc-head">
            <div class="gc-title">AI Assistant <span style="font-size:9px;color:var(--green);margin-left:8px;font-weight:400;">● online</span></div>
          </div>
          <div class="chat-msgs" style="flex:1; overflow-y:auto; max-height: calc(100% - 100px);">
            <div *ngFor="let msg of chatMessages" class="cmsg" [class.r]="msg.sender === 'user'">
              <div class="cav">{{msg.sender === 'user' ? 'ME' : 'AI'}}</div>
              <div class="cbub">{{msg.text}}</div>
            </div>
          </div>
          <div class="chat-ft">
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
  chatMessages: any[] = [{ sender: 'ai', text: 'Welcome! How can I assist with your shopping today?' }];
  history: string[] = [];

  auth = inject(AuthService);
  ai = inject(AiService);
  productService = inject(ProductService);

  ngOnInit() {
    this.productService.getProducts().subscribe(res => this.products = res);
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
    <div class="page-head">
      <div>
        <div class="page-title">Business Intelligence</div>
        <div class="page-sub">Live Monitoring</div>
      </div>
      <div class="head-r">
        <div class="chip">Last 30 days ↓</div>
        <div class="chip-teal">Export Data</div>
      </div>
    </div>
    <div class="app-content">
      <div class="kpi-row">
        <div class="kpi"><div class="kpi-label">Products</div><div class="kpi-val">{{products.length}}</div><div class="kpi-delta up">Database synced</div></div>
        <div class="kpi"><div class="kpi-label">Sales Flow</div><div class="kpi-val">Live</div><div class="kpi-delta up">● Active</div></div>
        <div class="kpi"><div class="kpi-label">Inventory</div><div class="kpi-val">Optimal</div><div class="kpi-delta up">Stock updated</div></div>
        <div class="kpi"><div class="kpi-label">Reviews</div><div class="kpi-val">Positive</div><div class="kpi-delta up">AI Moderated</div></div>
      </div>
      <div class="gcard">
        <div class="gc-head"><div class="gc-title">Product Catalog</div><div class="gc-link">View all →</div></div>
        <div class="gc-body" style="padding:0;">
           <table class="tbl">
             <thead><tr><th>Product Name</th><th>Category</th><th>Base Price</th></tr></thead>
             <tbody>
               <tr *ngFor="let p of products">
                 <td class="nm">{{p.name}}</td>
                 <td>{{p.category}}</td>
                 <td class="mono">{{p.basePrice | currency}}</td>
               </tr>
               <tr *ngIf="products.length === 0">
                 <td colspan="3" style="text-align:center; padding: 2rem; color:var(--text3);">No products available. Please import data.</td>
               </tr>
             </tbody>
           </table>
        </div>
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
  imports: [CommonModule],
  template: `
    <div class="page-head">
      <div>
        <div class="page-title">System Administration</div>
        <div class="page-sub">Security & Integrations</div>
      </div>
    </div>
    <div class="app-content">
       <div style="background:var(--red); border:1px solid rgba(224,112,112,0.3); padding:1rem; border-radius:8px; margin-bottom:1.5rem; color:var(--red); display:flex; align-items:center; gap:8px; font-size:12px; background-color: rgba(224,112,112, 0.05);">
          ⚠️ <b>Security Alert:</b> RBAC policies are strictly enforced. All database actions are logged.
       </div>
       <div class="gcard">
          <div class="gc-head"><div class="gc-title">Active Integration Logs (DS4, DS5, DS6)</div></div>
          <div class="gc-body">
            <p style="color:var(--text); font-size:12px; margin-bottom:12px;">ETL Pipeline Status: <span class="spill p-g">● OK</span></p>
            <p style="color:var(--text); font-size:12px;">Database Health (3NF): <span class="spill p-g">● Optimal</span></p>
          </div>
       </div>
    </div>
  `
})
export class AdminComponent {}
