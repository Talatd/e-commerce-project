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
    <div class="login-wrap">
      <div class="login-box">
        <div class="logo" style="justify-content:center; margin-bottom:15px;"><div class="logo-dot"></div>Nexus</div>
        <h2 style="text-align:center; color:var(--text); font-weight:500; font-family:'Playfair Display',serif; font-style:italic;">Welcome Back</h2>
        <p style="text-align:center; color:var(--text3); font-size:11px; margin-top:5px; margin-bottom:10px;">Advanced E-Commerce Platform</p>
        <input [(ngModel)]="email" class="login-input" placeholder="Email">
        <input [(ngModel)]="password" type="password" class="login-input" placeholder="Password">
        <button (click)="onLogin()" class="login-btn">Launch Dashboard</button>
        <p *ngIf="error" style="color:var(--red); text-align:center; margin-top:1rem; font-size:0.9rem;">{{error}}</p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = 'admin@smartstore.com';
  password = 'admin123';
  error = '';
  auth = inject(AuthService);
  router = inject(Router);

  onLogin() {
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (user) => {
        if (user.role === 'ADMIN') this.router.navigate(['/admin']);
        else if (user.role === 'MANAGER') this.router.navigate(['/manager']);
        else this.router.navigate(['/consumer']);
      },
      error: () => this.error = 'Invalid credentials'
    });
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
