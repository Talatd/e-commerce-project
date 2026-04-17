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
          
          <div class="c-item" *ngFor="let item of cartItems; let i = index">
            <div class="c-info">
              <div class="c-brand">{{item.category}}</div>
              <div class="c-name">{{item.name}}</div>
              <div class="c-price">{{item.basePrice | currency}}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px;">
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
            <button class="btn-primary" style="margin-top:20px;" (click)="checkout()">Proceed to Payment →</button>
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
    // In a real app we would inject a CartService. Using localStorage for demo continuity without backend endpoints.
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
    // Navigate to orders instead of actually paying
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
      <div class="row2" style="grid-template-columns: 1fr 350px;">
        <div class="gcard" style="padding:30px; display:flex; align-items:center; justify-content:center; background:var(--glass2);">
           <div style="font-size:120px; opacity:0.1; font-family:'Playfair Display',serif; font-style:italic;">Nexus Product</div>
        </div>
        <div class="gcard" style="padding:24px;">
           <div style="font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--teal); margin-bottom:8px;">{{product.category}}</div>
           <div style="font-family:'Playfair Display',serif; font-size:28px; margin-bottom:16px;">{{product.name}}</div>
           
           <div style="display:flex; align-items:baseline; gap:10px; margin-bottom:20px;">
             <div style="font-family:'Playfair Display',serif; font-size:32px;">{{product.basePrice | currency}}</div>
           </div>

           <div style="height:1px; background:var(--border); margin:16px 0;"></div>

           <p style="font-size:12px; color:var(--text2); line-height:1.6; margin-bottom:20px;">{{product.description}}</p>

           <div style="display:flex; align-items:center; gap:10px; margin-top:30px;">
              <button class="btn-primary" (click)="addToCart(product)">Add to Cart →</button>
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
  }

  addToCart(product: any) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let existing = cart.find((item: any) => item.productId === product.productId);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({...product, qty: 1});
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
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
    </div>
    <div class="app-content">
      <div class="row2">
        <div class="gcard" style="padding:22px;">
          <h3 style="font-family:'Playfair Display',serif;font-weight:400;font-style:italic;margin-bottom:20px;">Shipment Timeline</h3>
          <div class="timeline">
            <div class="tl-item">
              <div class="tl-left">
                <div class="tl-dot done"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5l2.5 2.5 5-5" stroke="#3ECFB2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <div class="tl-line done"></div>
              </div>
              <div class="tl-right"><div class="tl-title done">Order Confirmed</div><div class="tl-desc">Your order has been received.</div></div>
            </div>
            <div class="tl-item">
              <div class="tl-left">
                <div class="tl-dot done"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5l2.5 2.5 5-5" stroke="#3ECFB2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <div class="tl-line done"></div>
              </div>
              <div class="tl-right"><div class="tl-title done">Processing</div><div class="tl-desc">Items picked and packed.</div></div>
            </div>
            <div class="tl-item">
              <div class="tl-left">
                <div class="tl-dot active"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="3" y="5" width="7" height="5" rx="1.2" stroke="#3ECFB2" stroke-width="1.2"/><path d="M5 5V4a2 2 0 0 1 3 0v1" stroke="#3ECFB2" stroke-width="1.2"/></svg></div>
                <div class="tl-line idle"></div>
              </div>
              <div class="tl-right"><div class="tl-title active">In Transit ← You are here</div><div class="tl-desc">Package en route.</div></div>
            </div>
            <div class="tl-item">
              <div class="tl-left"><div class="tl-dot idle"></div></div>
              <div class="tl-right"><div class="tl-title idle">Out for Delivery</div></div>
            </div>
          </div>
        </div>

        <div>
          <div class="gcard" style="padding:18px; margin-bottom:12px; background:var(--teal-dim); border-color:var(--teal-glow);">
            <div style="font-size:9.5px;letter-spacing:0.12em;text-transform:uppercase;color:var(--teal);margin-bottom:8px;">Estimated Delivery</div>
            <div style="font-family:'Playfair Display',serif;font-size:22px;margin-bottom:4px;">Tomorrow</div>
            <div style="height:3px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:14px;overflow:hidden;"><div style="height:100%;width:65%;background:var(--teal);border-radius:2px;"></div></div>
          </div>
          <div class="gcard">
            <div class="gc-head"><div class="gc-title">Active Orders</div></div>
            <div class="gc-body" style="color:var(--text3); font-size:12px;text-align:center;">
               Order #ORD-7821 is currently active.
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrdersComponent {}
