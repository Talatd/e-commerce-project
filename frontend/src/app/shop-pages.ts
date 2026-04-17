import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from './services';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-head">
      <div>
        <div class="page-title">Your Cart</div>
        <div class="page-sub">Checkout and Payment</div>
      </div>
    </div>
    <div class="app-content">
      <div class="steps" style="margin-bottom:20px;">
        <div class="step">
          <div class="step-num done"><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#080808" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <span class="step-label done">Cart</span>
        </div>
        <div class="step-line done"></div>
        <div class="step"><div class="step-num active">2</div><span class="step-label active">Checkout</span></div>
        <div class="step-line"></div>
        <div class="step"><div class="step-num idle">3</div><span class="step-label idle">Payment</span></div>
        <div class="step-line"></div>
        <div class="step"><div class="step-num idle">4</div><span class="step-label idle">Confirmation</span></div>
      </div>

      <div class="row2">
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
            <button class="ripple-btn primary" style="width:100%; margin-top:20px;" (click)="checkout()">Proceed to Payment →</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  subtotal = 0;
  router = inject(Router);

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

  checkout() {
    localStorage.removeItem('cart');
    this.router.navigate(['/orders']);
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
  imports: [CommonModule],
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
          
          <div class="gcard">
            <div class="gc-head"><div class="gc-title">Carrier Info</div></div>
            <div class="gc-body" style="color:var(--text3); font-size:12px; line-height: 1.5;">
               <strong style="color:var(--text);">FedEx Express</strong><br>
               Tracking: FX-89234152<br><br>
               <button class="ripple-btn ghost" style="width:100%; padding:8px;">View Route Map</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrdersComponent {}
