import { Component, inject, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from './services';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head" style="display:flex;justify-content:space-between;" *ngIf="step < 3">
      <div>
        <div class="page-title">{{ step === 1 ? 'Your Cart' : 'Secure Checkout' }}</div>
        <div class="page-sub">{{ step === 1 ? 'Review your items' : 'Complete your payment' }}</div>
      </div>
      <div class="secure-badge" *ngIf="step === 2">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L2 2.8v3.5c0 2.5 1.8 4.5 4 5.2 2.2-.7 4-2.7 4-5.2V2.8L6 1Z" stroke="#344844" stroke-width="1"/></svg>
        256-bit SSL encrypted
      </div>
    </div>
    <div class="app-content" [style.padding]="step === 3 ? '0' : '20px'">
      <div class="steps" style="margin-bottom:20px;" *ngIf="step < 3">
        <div class="step">
          <div class="step-num done"><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#080808" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <span class="step-label done">Cart</span>
        </div>
        <div class="step-line done"></div>
        <div class="step">
          <div class="step-num" [class.active]="step === 2" [class.done]="step > 2" [class.idle]="step < 2">
             <span *ngIf="step <= 2">2</span>
             <svg *ngIf="step > 2" width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#080808" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <span class="step-label" [class.active]="step === 2" [class.done]="step > 2" [class.idle]="step < 2">Payment</span>
        </div>
        <div class="step-line" [class.done]="step > 2" [class.idle]="step <= 2"></div>
        <div class="step"><div class="step-num idle">3</div><span class="step-label idle">Confirmation</span></div>
      </div>

      <!-- STEP 1: CART -->
      <div class="row2" *ngIf="step === 1">
        <div class="gcard" style="padding: 20px;">
          <h3 style="margin-bottom:15px;font-family:'Playfair Display',serif;font-weight:400;font-style:italic;">Items ({{cartItems.length}})</h3>
          
          <div class="c-item tilt-card" *ngFor="let item of cartItems; let i = index" style="padding:16px; margin-bottom:10px; border:1px solid var(--border); box-shadow:none;">
            <div class="card-glow"></div>
            <div class="c-info" style="position:relative; z-index:2;">
              <div class="c-brand">{{item.category}}</div>
              <div class="c-name">{{item.name}}</div>
              <div class="c-price">{{item.basePrice | currency}}</div>
              <div class="stock-wrap" style="margin-top:8px;">
                <div class="stock-row">
                  <div class="stock-label"><div class="stock-dot ok"></div><span class="stock-text ok">Available</span></div>
                  <div class="stock-count ok">In Stock</div>
                </div>
                <div class="stock-bar"><div class="stock-bar-fill ok" style="width:75%"></div></div>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px; position:relative; z-index:2;">
              <div class="qty-box">
                <div class="qty-btn" (click)="updateQty(i, -1)">−</div>
                <div class="qty-val">{{item.qty}}</div>
                <div class="qty-btn" (click)="updateQty(i, 1)">+</div>
              </div>
              <div class="remove-btn" (click)="removeItem(i)" style="font-size:10px;color:var(--red);cursor:pointer;">Remove</div>
            </div>
          </div>
          <div *ngIf="cartItems.length === 0" style="padding: 2rem;text-align:center;color:var(--text3);">Your cart is empty.</div>
        </div>

        <div>
          <div class="summary-card">
            <h3 style="font-family:'Playfair Display',serif;font-weight:400;margin-bottom:20px;font-style:italic;">Order Summary</h3>
            <div class="summary-line"><span class="sl-label">Subtotal</span><span class="sl-val">{{subtotal | currency}}</span></div>
            <div class="summary-line"><span class="sl-label">Shipping</span><span class="sl-val green">Free</span></div>
            <div class="summary-divider"></div>
            <div class="summary-line" style="margin-top:14px;"><span class="sl-label" style="font-size:14px;color:var(--text);font-weight:500;">Total</span><span class="total-val">{{subtotal | currency}}</span></div>
            <button class="ripple-btn primary" style="width:100%; margin-top:20px;" (click)="goStep2()" [disabled]="cartItems.length === 0">Proceed to Payment →</button>
          </div>
        </div>
      </div>

      <!-- STEP 2: PAYMENT GATEWAY -->
      <div class="main" *ngIf="step === 2" style="grid-template-columns: 1fr 340px;">
        <div class="left">
          
          <!-- CARD VISUAL -->
          <div class="card-visual-wrap">
            <div class="card-visual" [class.flipped]="cardFlipped">
              <div class="card-front">
                <div class="card-network">
                  <span *ngIf="cardType === 'visa'" class="visa-logo" style="font-size:18px;">VISA</span>
                  <div *ngIf="cardType === 'mastercard'" class="mc-logo">
                    <div class="mc-r" style="width:20px;height:20px;"></div><div class="mc-l" style="width:20px;height:20px;margin-left:-8px;"></div>
                  </div>
                  <span *ngIf="cardType === 'amex'" style="font-size:16px;font-weight:700;color:#3ECFB2;letter-spacing:0.05em;">AMEX</span>
                </div>
                <div class="card-chip"></div>
                <div class="card-number-display">{{displayNum}}</div>
                <div class="card-bottom-row">
                  <div>
                    <div class="card-label">Card Holder</div>
                    <div class="card-value card-holder-name">{{displayName}}</div>
                  </div>
                  <div>
                    <div class="card-label">Expires</div>
                    <div class="card-value">{{displayExp}}</div>
                  </div>
                </div>
              </div>
              <div class="card-back">
                <div class="card-stripe"></div>
                <div class="card-cvv-row">
                  <div class="cvv-label">CVV</div>
                  <div class="cvv-box">{{displayCvv}}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- ADDRESS TAB -->
          <div class="section-title" style="margin-bottom:10px;">Delivery Address</div>
          <div class="addr-tabs">
            <div class="addr-tab" [class.active]="addrMode === 'saved'" (click)="addrMode = 'saved'">Saved Addresses</div>
            <div class="addr-tab" [class.active]="addrMode === 'new'" (click)="addrMode = 'new'">+ New Address</div>
          </div>
          
          <div *ngIf="addrMode === 'saved'">
            <div class="saved-addr">
              <div class="addr-card sel">
                <div class="addr-radio"><div class="addr-rdot"></div></div>
                <div>
                  <div class="addr-name">Home</div>
                  <div class="addr-detail">123 Nexus Grove, Build 4<br>San Francisco, CA 94107</div>
                </div>
                <div class="addr-default">Default</div>
              </div>
            </div>
          </div>

          <!-- CARD INPUT FIELDS -->
          <div class="section-title" style="margin-top:20px;margin-bottom:12px;">Card Details</div>
          <div class="fields">
            <div class="field">
              <div class="field-label">Card Number</div>
              <div class="card-input-wrap">
                <input class="fi fi-card" placeholder="0000 0000 0000 0000" maxlength="19" [(ngModel)]="rawNum" (input)="onNumInput()" [class.error]="numErr"/>
                <div class="card-type-badge">
                  <span *ngIf="cardType === 'visa'" class="visa-logo">VISA</span>
                  <div *ngIf="cardType === 'mastercard'" class="mc-logo"><div class="mc-r"></div><div class="mc-l"></div></div>
                  <span *ngIf="cardType === 'amex'" style="font-size:11px;font-weight:700;color:#3ECFB2;letter-spacing:0.05em;">AMEX</span>
                </div>
              </div>
              <div class="field-error" [class.show]="numErr">Please enter a valid 16-digit card number</div>
            </div>
            
            <div class="field">
              <div class="field-label">Cardholder Name</div>
              <input class="fi" placeholder="Full name on card" [(ngModel)]="rawName"/>
            </div>

            <div class="field-row" style="grid-template-columns:1fr 1fr;">
              <div class="field">
                <div class="field-label">Expiry Date</div>
                <input class="fi" placeholder="MM / YY" maxlength="7" [(ngModel)]="rawExp" (input)="onExpInput()" (focus)="cardFlipped = false" [class.error]="expErr"/>
                <div class="field-error" [class.show]="expErr">Invalid expiry date</div>
              </div>
              <div class="field">
                <div class="field-label">CVV</div>
                <input class="fi" placeholder="•••" maxlength="4" [(ngModel)]="rawCvv" (input)="onCvvInput()" (focus)="cardFlipped = true" (blur)="cardFlipped = false" [class.error]="cvvErr"/>
                <div class="field-error" [class.show]="cvvErr">Invalid CVV</div>
              </div>
            </div>
          </div>
        </div>

        <div class="right">
          <div class="summary-title" style="margin-top:0;">Order Summary</div>
          <div class="order-items">
            <div class="oi" *ngFor="let i of cartItems">
               <div class="oi-name" style="line-height:1.2;">{{i.name}}<br><span class="oi-var">{{i.category}} × {{i.qty}}</span></div>
               <div class="oi-price">{{i.basePrice * i.qty | currency}}</div>
            </div>
          </div>
          <div class="summary-lines">
            <div class="sl"><span class="sl-label">Subtotal</span><span class="sl-val">{{subtotal | currency}}</span></div>
            <div class="sl"><span class="sl-label">Shipping</span><span class="sl-val green">Free</span></div>
            <div class="sl"><span class="sl-label">Tax (8%)</span><span class="sl-val">{{subtotal * 0.08 | currency}}</span></div>
            <div class="sl" style="border-top:1px solid var(--border);padding-top:10px;margin-top:2px;">
              <span class="sl-total-label">Total</span>
              <span class="sl-total">{{subtotal * 1.08 | currency}}</span>
            </div>
          </div>

          <button class="pay-btn" (click)="processPayment()" [disabled]="isProcessing || paySuccess">
            <ng-container *ngIf="!isProcessing && !paySuccess">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" stroke="#080808" stroke-width="1.2"/><path d="M1 7h12" stroke="#080808" stroke-width="1.2"/></svg>
              Pay {{subtotal * 1.08 | currency}}
            </ng-container>
            <span *ngIf="isProcessing" class="spin">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5A5.5 5.5 0 1 1 1.5 7" stroke="#080808" stroke-width="1.6" stroke-linecap="round"/></svg>
            </span>
            <span *ngIf="paySuccess">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="#3EC98A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Payment Successful!
            </span>
          </button>

          <div class="secure-note">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1L2 2.5v3c0 2.2 1.5 4 3.5 4.8C7.5 9.5 9 7.7 9 5.5v-3L5.5 1Z" stroke="#344844" stroke-width="1"/></svg>
            Secured by Nexus Pay
          </div>
        </div>
      </div>

      <!-- STEP 3: ORDER SUCCESS -->
      <div class="content-success" *ngIf="step === 3" style="min-height: 600px; display:flex; flex-direction:column; position:relative; overflow:hidden;">
        <canvas #confettiCanvas id="confetti-canvas"></canvas>
        <div class="bg-glow"></div>

        <div class="success-icon-wrap" style="margin-top:20px;">
          <div class="pulse-ring pr1"></div>
          <div class="pulse-ring pr2"></div>
          <div class="pulse-ring pr3"></div>
          <div class="success-icon">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path class="check-path" d="M8 18l6 7 14-16" stroke="#3EC98A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <div class="order-id-badge">
          <div class="order-id-label">Order</div>
          <div class="order-id-val">#ORD-{{orderId}}</div>
        </div>

        <div class="success-title">Order <em>confirmed,</em><br>{{displayName}}! 🎉</div>
        <div class="success-sub">Payment of {{subtotal * 1.08 | currency}} was processed successfully. A confirmation has been sent to your email.</div>

        <div class="eta-bar">
          <div class="eta-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9h14M10 4l5 5-5 5" stroke="#3ECFB2" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div>
            <div class="eta-label">Estimated Delivery</div>
            <div class="eta-val">December 5, 2024</div>
            <div class="eta-sub">Between 2:00 PM – 6:00 PM · Home</div>
          </div>
          <div class="eta-track">
            <div class="eta-track-label">Tracking ID</div>
            <div class="eta-track-val">FX-89234152</div>
          </div>
        </div>

        <div class="summary-card" style="margin: 0 auto; margin-bottom: 24px; animation:fade-up 0.5s ease 0.8s both;">
          <div class="sc-head">
            <div class="sc-title">Order Summary</div>
            <div style="font-size:10px;color:var(--text3);">{{cartItems.length}} items</div>
          </div>
          <div class="sc-items">
            <div class="sc-item" *ngFor="let item of cartItems">
              <div class="sc-img" style="background:rgba(62,207,178,0.04);">
                 <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="5" width="14" height="9" rx="2" stroke="#3ECFB2" stroke-width="1.1" opacity="0.5"/><rect x="7" y="14" width="4" height="1.5" rx="0.75" fill="rgba(62,207,178,0.2)"/></svg>
              </div>
              <div style="flex:1;min-width:0;">
                <div class="sc-name">{{item.name}}</div>
                <div class="sc-var">{{item.category}}</div>
              </div>
              <div class="sc-qty">×{{item.qty}}</div>
              <div class="sc-price">{{item.basePrice | currency}}</div>
            </div>
          </div>
          <div class="sc-totals">
            <div class="sc-line"><span class="sc-line-label">Subtotal</span><span class="sc-line-val">{{subtotal | currency}}</span></div>
            <div class="sc-line"><span class="sc-line-label">Shipping</span><span class="sc-line-val green">Free</span></div>
            <div class="sc-line"><span class="sc-line-label">Tax (8%)</span><span class="sc-line-val">{{subtotal * 0.08 | currency}}</span></div>
            <div class="sc-total-row">
              <span class="sc-total-label">Total Paid</span>
              <span class="sc-total-val">{{subtotal * 1.08 | currency}}</span>
            </div>
          </div>
        </div>

        <div class="actions" style="margin:0 auto;">
          <button class="btn-primary" routerLink="/orders">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="5.5" r="4" stroke="#080808" stroke-width="1.2"/><path d="M2 13c0-3 2-4.5 4.5-4.5S11 10 11 13" stroke="#080808" stroke-width="1.2" stroke-linecap="round"/></svg>
            Track Order
          </button>
          <button class="btn-ghost" routerLink="/shop">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 4h7l-1 6H4L3 4Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/><circle cx="5.5" cy="11.5" r="1" fill="currentColor"/><circle cx="8.5" cy="11.5" r="1" fill="currentColor"/></svg>
            Continue Shopping
          </button>
        </div>

        <div class="replay-btn" (click)="launchConfetti()">✦ Replay confetti</div>
      </div>

    </div>
  `
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: any[] = [];
  subtotal = 0;
  step = 1;
  router = inject(Router);

  // Payment Form State
  addrMode = 'saved';
  cardFlipped = false;
  rawNum = '';
  rawName = '';
  rawExp = '';
  rawCvv = '';
  
  numErr = false;
  expErr = false;
  cvvErr = false;

  isProcessing = false;
  paySuccess = false;
  orderId = Math.floor(1000 + Math.random() * 9000);

  // Confetti State
  @ViewChild('confettiCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;
  animId: any;
  pieces: any[] = [];
  frameCount = 0;
  ctx: CanvasRenderingContext2D | null = null;

  ngOnInit() {
    this.cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    this.calculateTotal();
  }

  updateQty(index: number, change: number) {
    this.cartItems[index].qty += change;
    if (this.cartItems[index].qty <= 0) this.cartItems.splice(index, 1);
    this.saveCart();
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
    this.saveCart();
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.calculateTotal();
  }

  calculateTotal() {
    this.subtotal = this.cartItems.reduce((acc, item) => acc + (item.basePrice * item.qty), 0);
  }

  goStep2() {
    this.step = 2;
  }

  get cardType() {
    const fn = this.rawNum.replace(/\D/g,'');
    if(fn.startsWith('4')) return 'visa';
    if(fn.startsWith('5') || fn.startsWith('2')) return 'mastercard';
    if(fn.startsWith('3')) return 'amex';
    return '';
  }

  get displayNum() {
    return this.rawNum.padEnd(19,'•').replace(/ /g,'•');
  }

  get displayName() {
    return this.rawName.toUpperCase() || 'YOUR NAME';
  }

  get displayExp() {
    return this.rawExp || 'MM/YY';
  }

  get displayCvv() {
    return '•'.repeat(this.rawCvv.length) || '•••';
  }

  onNumInput() {
    let v = this.rawNum.replace(/\D/g,'').slice(0,16);
    this.rawNum = v.replace(/(.{4})/g,'$1 ').trim();
    this.numErr = false;
  }

  onExpInput() {
    let v = this.rawExp.replace(/\D/g,'');
    if(v.length >= 3) v = v.slice(0,2) + ' / ' + v.slice(2,4);
    this.rawExp = v;
    this.expErr = false;
  }

  onCvvInput() {
    this.rawCvv = this.rawCvv.replace(/\D/g,'').slice(0,4);
    this.cvvErr = false;
  }

  processPayment() {
    const cleanNum = this.rawNum.replace(/\\s/g,'');
    let valid = true;

    if (cleanNum.length < 16) { this.numErr = true; valid = false; }
    if (this.rawExp.replace(/\\D/g,'').length < 4) { this.expErr = true; valid = false; }
    if (this.rawCvv.length < 3) { this.cvvErr = true; valid = false; }

    if (!valid) return;

    this.isProcessing = true;
    setTimeout(() => {
      this.isProcessing = false;
      this.paySuccess = true;
      setTimeout(() => {
        this.step = 3;
        setTimeout(() => this.launchConfetti(), 100);
      }, 1500);
    }, 2000);
  }

  // --- CONFETTI LOGIC ---
  @HostListener('window:resize')
  onResize() {
    if (this.step === 3 && this.canvasRef) {
      const c = this.canvasRef.nativeElement;
      const parent = c.parentElement;
      if (parent) {
        c.width = parent.offsetWidth;
        c.height = parent.offsetHeight;
      }
    }
  }

  launchConfetti() {
    if (!this.canvasRef) return;
    const c = this.canvasRef.nativeElement;
    this.ctx = c.getContext('2d');
    this.onResize();
    const colors = ['#3ECFB2','#6EDEC8','#3EC98A','#E8A94A','#6BA8C8','#A78BCC','#E6F0EE','rgba(62,207,178,0.7)'];
    
    this.pieces = Array.from({length: 90}, () => {
      return {
        x: Math.random() * c.width,
        y: Math.random() * -c.height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: Math.random() * 2.5 + 1.5,
        vx: (Math.random() - 0.5) * 1.5,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.12,
        opacity: Math.random() * 0.5 + 0.5,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      };
    });
    
    this.frameCount = 0;
    if (this.animId) cancelAnimationFrame(this.animId);
    this.animateConfetti();
  }

  animateConfetti = () => {
    if (!this.ctx || !this.canvasRef) return;
    const c = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, c.width, c.height);
    
    this.pieces.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;
      p.rot += p.vrot;
      p.vy += 0.03;
      if (p.y > c.height + 20) {
        p.x = Math.random() * c.width;
        p.y = -10;
        p.vy = Math.random() * 2.5 + 1.5;
        p.vx = (Math.random() - 0.5) * 1.5;
      }
      
      this.ctx!.save();
      this.ctx!.globalAlpha = p.opacity;
      this.ctx!.translate(p.x, p.y);
      this.ctx!.rotate(p.rot);
      this.ctx!.fillStyle = p.color;
      if (p.shape === 'rect') {
        this.ctx!.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      } else {
        this.ctx!.beginPath();
        this.ctx!.arc(0, 0, p.w/2, 0, Math.PI*2);
        this.ctx!.fill();
      }
      this.ctx!.restore();
    });
    
    this.frameCount++;
    if (this.frameCount < 280) {
      this.animId = requestAnimationFrame(this.animateConfetti);
    } else {
      this.ctx.clearRect(0, 0, c.width, c.height);
    }
  }

  ngOnDestroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.step === 3) localStorage.removeItem('cart');
  }
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-head" *ngIf="product">
      <div>
        <div class="page-title">{{product.name}}</div>
        <div class="page-sub">{{product.category}}</div>
      </div>
    </div>
    <div class="app-content" *ngIf="product">
      <div class="row2" style="grid-template-columns: 1fr 370px;">
        <div class="gcard" style="padding:30px; display:flex; align-items:center; justify-content:center; background:var(--glass2);">
           <div style="font-size:120px; opacity:0.1; font-family:'Playfair Display',serif; font-style:italic;">Nexus Product</div>
        </div>
        <div class="gcard tilt-card" style="padding:24px;" id="prod-card">
           <div class="card-glow"></div>
           <div style="position:relative; z-index:2;">
             <div style="font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--teal); margin-bottom:8px;">{{product.category}}</div>
             <div style="font-family:'Playfair Display',serif; font-size:28px; margin-bottom:16px;">{{product.name}}</div>
             
             <div style="display:flex; align-items:baseline; gap:10px; margin-bottom:20px;">
               <div style="font-family:'Playfair Display',serif; font-size:32px;">{{product.basePrice | currency}}</div>
             </div>

             <div class="stock-wrap">
               <div class="stock-row">
                 <div class="stock-label"><div class="stock-dot low"></div><span class="stock-text low">Low Stock</span></div>
                 <div class="stock-count low">Only {{product.stockQuantity || 8}} left</div>
               </div>
               <div class="stock-bar"><div class="stock-bar-fill low" style="width:18%"></div></div>
             </div>
             <div class="countdown-wrap low" style="display:flex;align-items:center;gap:5px;padding:5px 8px;border-radius:6px;background:var(--amber-dim);border:1px solid rgba(232,169,74,0.1);margin-bottom:16px;width:fit-content;">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="#E8A94A" stroke-width="1"/><path d="M5.5 3v2.5l1.5 1.5" stroke="#E8A94A" stroke-width="1" stroke-linecap="round"/></svg>
                <span style="font-size:10px;color:var(--amber);">Selling fast</span>
             </div>

             <div style="height:1px; background:var(--border); margin:16px 0;"></div>

             <p style="font-size:12px; color:var(--text2); line-height:1.6; margin-bottom:20px;">{{product.description}}</p>

             <div style="display:flex; align-items:center; gap:10px; margin-top:30px;">
                <button class="ripple-btn primary" style="width:100%; display:flex; align-items:center; justify-content:center; gap:8px;" (click)="addToCart($event, product)">
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M1 1h1.4l1.5 5h5l1.2-3.4H3.6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/><circle cx="5.5" cy="10" r="1" fill="currentColor"/><circle cx="8.5" cy="10" r="1" fill="currentColor"/></svg>
                  Add to Cart
                </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  product: any;
  route = inject(ActivatedRoute);
  productService = inject(ProductService);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productService.getProducts().subscribe(res => {
          this.product = res.find((p: any) => p.productId === +id);
        });
      }
    });

    const card = document.getElementById('prod-card');
    if (card) {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        card.style.setProperty('--cx', x + 'px');
        card.style.setProperty('--cy', y + 'px');
      });
    }
  }

  addToCart(event: any, product: any) {
    // Add fly particle visually
    const rect = event.target.getBoundingClientRect();
    const p = document.createElement('div');
    p.className = 'fly-particle';
    p.style.left = (rect.left + rect.width / 2) + 'px';
    p.style.top = (rect.top + rect.height / 2) + 'px';
    document.body.appendChild(p);

    const targetX = window.innerWidth - 60; // Approximate cart pos
    const targetY = 40;

    const startX = parseFloat(p.style.left);
    const startY = parseFloat(p.style.top);
    let start = performance.now();

    function flyAnim(ts: number) {
      const prog = Math.min((ts - start) / 500, 1);
      const ease = prog < 0.5 ? 2 * prog * prog : -1 + (4 - 2 * prog) * prog;
      const cx = startX + (targetX - startX) * ease;
      const cy = startY + (targetY - startY) * ease - Math.sin(Math.PI * prog) * 80;
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.transform = 'translate(-50%,-50%) scale(' + (1 - prog * 0.5) + ')';
      p.style.opacity = (1 - prog * 0.3).toString();

      if (prog < 1) requestAnimationFrame(flyAnim);
      else p.remove();
    }
    requestAnimationFrame(flyAnim);

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let existing = cart.find((item: any) => item.productId === product.productId);
    if (existing) existing.qty++;
    else cart.push({...product, qty: 1});
    localStorage.setItem('cart', JSON.stringify(cart));
  }
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div>
        <div class="page-title">Order Tracking</div>
        <div class="page-sub">Trace your recent purchases</div>
      </div>
      <div class="status-pill" style="display:inline-flex;align-items:center;gap:6px;background:rgba(107,168,200,0.1);border:1px solid rgba(107,168,200,0.2);color:#6BA8C8;font-size:11px;padding:6px 14px;border-radius:20px;">
        <div class="live-dot" style="width:6px;height:6px;border-radius:50%;background:#6BA8C8;animation:pulse-blue 1.5s infinite;"></div>
        In Transit
      </div>
    </div>
    <div class="app-content">

      <!-- TIMELINE PROGRESS -->
      <div class="progress-wrap" style="margin-bottom:40px;">
        <div class="progress-track">
          <div class="progress-fill" style="width:65%;"></div>
        </div>
        <div class="progress-labels">
          <span class="prog-label active">Confirmed</span>
          <span class="prog-label active">Processing</span>
          <span class="prog-label active">Shipped</span>
          <span class="prog-label active">In Transit</span>
          <span class="prog-label">Delivered</span>
        </div>
      </div>

      <div class="row2">
        <div class="gcard" style="padding:22px;">
          <h3 style="font-family:'Playfair Display',serif;font-weight:400;font-style:italic;margin-bottom:20px;">Shipment Timeline</h3>
          
          <div class="timeline">
            <!-- Step 1 -->
            <div class="tl-item done">
              <div class="tl-left">
                <div class="tl-dot done"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5l2.5 2.5 5-5" stroke="#3ECFB2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
              </div>
              <div class="tl-right">
                <div class="tl-title done">Order Confirmed <span class="tl-time">09:14 AM</span></div>
                <div class="tl-desc">Payment verified. Order confirmed.</div>
              </div>
            </div>
            
            <!-- Step 2 -->
            <div class="tl-item done">
              <div class="tl-left">
                <div class="tl-dot done"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5l2.5 2.5 5-5" stroke="#3ECFB2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
              </div>
              <div class="tl-right">
                <div class="tl-title done">Processing <span class="tl-time">14:30 PM</span></div>
                <div class="tl-desc">Items packed at Istanbul Warehouse.</div>
              </div>
            </div>

            <!-- Step 3 / Active -->
            <div class="tl-item active">
              <div class="tl-left">
                <div class="tl-dot active"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="#3ECFB2" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
              </div>
              <div class="tl-right">
                <div class="tl-title active">In Transit — Live <span class="tl-time">11:47 AM</span></div>
                <div class="tl-desc">Package is on its way. Last checkpoint scanned.</div>
                
                <div class="scan-wrap" style="margin-bottom:10px;">
                  <div class="scan-line"></div>
                  <div class="scan-text" style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3);display:flex;align-items:center;gap:8px;">
                    <div class="scan-dot" style="width:5px;height:5px;border-radius:50%;background:var(--teal);animation:blink 1s infinite;"></div>
                    Scanning live location updates...
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4 -->
            <div class="tl-item idle">
              <div class="tl-left">
                <div class="tl-dot idle"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="#344844" stroke-width="1.1"/><path d="M6 4v2.5l1.5 1.5" stroke="#344844" stroke-width="1.1" stroke-linecap="round"/></svg></div>
              </div>
              <div class="tl-right">
                <div class="tl-title idle">Out for Delivery</div>
                <div class="tl-desc">Est. Tomorrow</div>
              </div>
            </div>
            
          </div>
        </div>

        <div>
          <div class="gcard tilt-card" style="padding:18px; margin-bottom:12px; background:var(--teal-dim); border-color:var(--teal-glow);">
            <div class="card-glow"></div>
            <div style="position:relative; z-index:2;">
              <div style="font-size:9.5px;letter-spacing:0.12em;text-transform:uppercase;color:var(--teal);margin-bottom:8px;">Estimated Delivery</div>
              <div style="font-family:'Playfair Display',serif;font-size:22px;margin-bottom:4px;">Tomorrow</div>
              <div style="height:3px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:14px;overflow:hidden;"><div style="height:100%;width:65%;background:var(--teal);border-radius:2px;"></div></div>
            </div>
          </div>
          
          <div class="gcard" style="margin-bottom: 12px;">
            <div class="gc-head"><div class="gc-title">Carrier Info</div></div>
            <div class="gc-body" style="color:var(--text3); font-size:12px; line-height: 1.5;">
               <strong style="color:var(--text);">FedEx Express</strong><br>
               Tracking: FX-89234152<br><br>
               <button class="ripple-btn ghost" style="width:100%; padding:8px;">View Route Map</button>
            </div>
          </div>

          <div class="gcard" style="padding:22px; display:flex; flex-direction:column; align-items:center; gap:10px; background:rgba(62,207,178,0.03);">
             <h3 style="font-family:'Playfair Display',serif;font-weight:400;font-style:italic;">Got it already?</h3>
             <p style="font-size:11px;color:var(--text2);text-align:center;">If you received this part of your order, let us know how we did.</p>
             <button class="open-btn" (click)="openModal()" style="margin-top:4px;">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L8.6 5.2H13L9.7 7.8l1.3 4.2L7 9.5 2.9 12l1.3-4.2L1 5.2h4.4L7 1Z" stroke="#080808" stroke-width="1.2" stroke-linejoin="round"/></svg>
                Write a Review
             </button>
          </div>
        </div>
      </div>

      <!-- REVIEW MODAL OVERLAY -->
      <div id="overlay" [class.open]="isModalOpen" (click)="handleOverlayClick($event)">
        <div class="modal" id="modal">
          <!-- FORM STATE -->
          <div *ngIf="!isSuccess">
            <div class="modal-head">
              <div class="mh-product">
                <div class="mh-img">
                  <svg width="22" height="22" viewBox="0 0 28 28" fill="none"><rect x="3" y="7" width="22" height="14" rx="2.5" stroke="#3ECFB2" stroke-width="1.2" opacity="0.5"/><rect x="5" y="9" width="18" height="10" rx="1.5" fill="rgba(62,207,178,0.04)"/></svg>
                </div>
                <div>
                  <div class="mh-name">Recent Order</div>
                  <div class="mh-sub">Share your experience</div>
                </div>
              </div>
              <div class="close-btn" (click)="closeModal()">×</div>
            </div>

            <div class="modal-title">How would you <em>rate it?</em></div>

            <!-- STARS -->
            <div class="stars-section">
              <div class="stars-label">Overall rating</div>
              <div class="stars-row">
                <div class="star-btn" *ngFor="let s of [1,2,3,4,5]" 
                     [class.selected]="rating >= s" [class.pop]="popStar === s"
                     (click)="setRating(s)" (mouseenter)="hoverRating = s" (mouseleave)="hoverRating = 0">
                  <svg class="star-svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <path d="M18 4l3.5 9H31l-7.7 5.6 3 9L18 22.5 9.7 27.6l3-9L5 13h9.5L18 4Z" 
                          [attr.fill]="(hoverRating > 0 ? hoverRating >= s : rating >= s) ? '#E8A94A' : 'none'" 
                          [attr.stroke]="(hoverRating > 0 ? hoverRating >= s : rating >= s) ? '#E8A94A' : '#344844'" 
                          stroke-width="1.3" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <div class="rating-text" [style.color]="ratingColor">{{ratingText}}</div>
            </div>

            <div class="review-body">
              <div style="font-size:9.5px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text3);margin-bottom:8px;">Your review</div>
              <textarea class="review-textarea" placeholder="What did you like or dislike?" [(ngModel)]="reviewText" (input)="updateChar()"></textarea>
              <div class="char-row"><span class="char-count" [class.warn]="charCount > 400" [class.over]="charCount > 500">{{charCount}} / 500</span></div>
            </div>

            <div class="tags-section">
              <div style="font-size:9.5px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text3);margin-bottom:10px;">Quick tags</div>
              <div class="tags-row">
                <div class="tag" *ngFor="let t of tags" [class.selected]="t.selected" (click)="t.selected = !t.selected">{{t.label}}</div>
              </div>
            </div>

            <div class="modal-foot">
              <div class="foot-hint">Your review helps others</div>
              <button class="submit-btn" [disabled]="!canSubmit()" (click)="submitReview()">
                <ng-container *ngIf="!isSubmitting">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5L5 10l6.5-7" stroke="#080808" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  Submit Review
                </ng-container>
                <span *ngIf="isSubmitting" class="spin">
                   <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5A5 5 0 1 1 1.5 6.5" stroke="#080808" stroke-width="1.5" stroke-linecap="round"/></svg>
                </span>
              </button>
            </div>
          </div>

          <!-- SUCCESS STATE -->
          <div class="success-state" *ngIf="isSuccess" style="display:flex;">
            <div class="success-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 14l7 7L24 7" stroke="#3EC98A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="success-title">Thank you for your <em>review!</em></div>
            <div class="success-sub">Your feedback helps thousands of shoppers make better decisions. We really appreciate it.</div>
            <button class="submit-btn" style="margin-top:8px;" (click)="closeModal()">Back to tracking →</button>
          </div>

        </div>
      </div>

    </div>
  `
})
export class OrdersComponent {
  isModalOpen = false;
  isSuccess = false;
  isSubmitting = false;
  rating = 0;
  hoverRating = 0;
  popStar = 0;
  reviewText = '';
  charCount = 0;

  tags = [
    {label: 'Great value', selected: false},
    {label: 'Fast delivery', selected: false},
    {label: 'Premium quality', selected: false},
    {label: 'As described', selected: false},
    {label: 'Would recommend', selected: false}
  ];

  labels = ['Tap a star to rate','Terrible 😬','Not great 😕',"It's okay 🤔",'Really good 👍','Outstanding! 🌟'];
  colors = ['var(--text2)','#E07070','#E8A94A','#6BA8C8','#3EC98A','#3ECFB2'];

  get ratingText() { return this.labels[this.hoverRating || this.rating]; }
  get ratingColor() { return this.colors[this.hoverRating || this.rating]; }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    setTimeout(() => {
      this.isSuccess = false;
      this.rating = 0;
      this.reviewText = '';
      this.charCount = 0;
      this.tags.forEach(t => t.selected = false);
    }, 400);
  }

  handleOverlayClick(e: Event) {
    if ((e.target as HTMLElement).id === 'overlay') this.closeModal();
  }

  setRating(val: number) {
    this.rating = val;
    this.popStar = val;
    setTimeout(() => this.popStar = 0, 350);
  }

  updateChar() {
    this.charCount = this.reviewText.length;
  }

  canSubmit() {
    return this.rating > 0 && this.reviewText.trim().length > 10 && this.charCount <= 500 && !this.isSubmitting;
  }

  submitReview() {
    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.isSuccess = true;
    }, 1500);
  }
}
