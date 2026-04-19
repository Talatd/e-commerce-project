import { Component, inject, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService, OrderService, AuthService, ToastService, ShipmentService } from './services';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="nx-page">

      <!-- NAVBAR -->
      <div class="nx-navbar">
        <div class="nx-logo" routerLink="/consumer"><div class="nx-logo-dot"></div>Nexus</div>
        <div class="nx-nav-pills">
          <div class="nx-npill" routerLink="/consumer">Home</div>
          <div class="nx-npill active">Shop</div>
          <div class="nx-npill" routerLink="/orders">Orders</div>
          <div class="nx-npill" routerLink="/settings">Settings</div>
        </div>
        <div class="nx-nav-r">
          <div class="nx-icon-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h1.5l1.8 6.5h5.4l1.3-4H4.5" stroke="#6A8A84" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="11" r="1" fill="#6A8A84"/><circle cx="10" cy="11" r="1" fill="#6A8A84"/></svg>
            <div class="nx-cart-badge" *ngIf="totalQty > 0">{{totalQty}}</div>
          </div>
          <div class="nx-nbtn" routerLink="/consumer">← Back to Shop</div>
        </div>
      </div>

      <!-- STEPS -->
      <div class="nx-steps" *ngIf="step < 3">
        <div class="nx-step">
          <div class="nx-step-num done"><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#080808" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <span class="nx-step-label done">Cart</span>
        </div>
        <div class="nx-step-line done"></div>
        <div class="nx-step">
          <div class="nx-step-num" [class.active]="step === 1" [class.done]="step > 1" [class.idle]="false">
            <span *ngIf="step <= 1">2</span>
            <svg *ngIf="step > 1" width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#080808" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <span class="nx-step-label" [class.active]="step === 1" [class.done]="step > 1">Checkout</span>
        </div>
        <div class="nx-step-line" [class.done]="step > 1"></div>
        <div class="nx-step">
          <div class="nx-step-num" [class.active]="step === 2" [class.done]="step > 2" [class.idle]="step < 2">
            <span *ngIf="step <= 2">3</span>
            <svg *ngIf="step > 2" width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#080808" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <span class="nx-step-label" [class.active]="step === 2" [class.done]="step > 2" [class.idle]="step < 2">Payment</span>
        </div>
        <div class="nx-step-line" [class.done]="step > 2"></div>
        <div class="nx-step">
          <div class="nx-step-num idle">4</div>
          <span class="nx-step-label idle">Confirmation</span>
        </div>
      </div>

      <!-- STEP 1: CART + CHECKOUT -->
      <div class="nx-cart-main" *ngIf="step === 1">
        <div class="nx-cart-left">
          <div class="section-title">Your Cart ({{totalQty}})</div>

          <div class="nx-cart-item" *ngFor="let item of cartItems; let i = index">
            <div class="nx-item-img">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect x="4" y="8" width="28" height="18" rx="3" stroke="#3ECFB2" stroke-width="1.2" opacity="0.5"/><rect x="13" y="26" width="10" height="2.5" rx="1.2" fill="rgba(62,207,178,0.2)"/><rect x="7" y="11" width="22" height="12" rx="1.5" fill="rgba(62,207,178,0.05)"/></svg>
            </div>
            <div class="nx-item-info">
              <div class="nx-item-brand">{{item.category}}</div>
              <div class="nx-item-name">{{item.name}}</div>
              <div class="nx-item-variant">{{item.variant || item.description || '—'}}</div>
            </div>
            <div class="nx-item-right">
              <div class="nx-item-price">{{item.basePrice * item.qty | currency}}</div>
              <div class="qty-box">
                <div class="qty-btn" (click)="updateQty(i, -1)">−</div>
                <div class="qty-val">{{item.qty}}</div>
                <div class="qty-btn" (click)="updateQty(i, 1)">+</div>
              </div>
              <div class="nx-remove-btn" (click)="removeItem(i)">Remove</div>
            </div>
          </div>

          <div *ngIf="cartItems.length === 0" style="padding:3rem;text-align:center;color:var(--text3);font-size:13px;">Your cart is empty.</div>

          <!-- COUPON -->
          <div class="nx-coupon-row" *ngIf="cartItems.length > 0">
            <input class="nx-coupon-input" placeholder="Enter coupon code..." [(ngModel)]="couponCode"/>
            <div class="nx-coupon-btn" (click)="applyCoupon()">Apply</div>
          </div>

          <!-- DELIVERY METHOD -->
          <div class="nx-delivery-section" *ngIf="cartItems.length > 0">
            <div class="nx-delivery-title">Delivery Method</div>
            <div class="nx-delivery-opts">
              <div class="nx-delivery-opt" [class.active]="deliveryMethod === 'standard'" (click)="deliveryMethod = 'standard'; deliveryCost = 0">
                <div class="nx-delivery-left">
                  <div class="nx-delivery-radio"><div class="nx-delivery-radio-dot" *ngIf="deliveryMethod === 'standard'"></div></div>
                  <div>
                    <div class="nx-delivery-name">Standard Shipping</div>
                    <div class="nx-delivery-eta">3–5 business days</div>
                  </div>
                </div>
                <div class="nx-delivery-free">Free</div>
              </div>
              <div class="nx-delivery-opt" [class.active]="deliveryMethod === 'express'" (click)="deliveryMethod = 'express'; deliveryCost = 9.99">
                <div class="nx-delivery-left">
                  <div class="nx-delivery-radio"><div class="nx-delivery-radio-dot" *ngIf="deliveryMethod === 'express'"></div></div>
                  <div>
                    <div class="nx-delivery-name">Express Shipping</div>
                    <div class="nx-delivery-eta">1–2 business days</div>
                  </div>
                </div>
                <div class="nx-delivery-price">$9.99</div>
              </div>
              <div class="nx-delivery-opt" [class.active]="deliveryMethod === 'sameday'" (click)="deliveryMethod = 'sameday'; deliveryCost = 19.99">
                <div class="nx-delivery-left">
                  <div class="nx-delivery-radio"><div class="nx-delivery-radio-dot" *ngIf="deliveryMethod === 'sameday'"></div></div>
                  <div>
                    <div class="nx-delivery-name">Same Day Delivery</div>
                    <div class="nx-delivery-eta">Today by 9 PM</div>
                  </div>
                </div>
                <div class="nx-delivery-price">$19.99</div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: ORDER SUMMARY -->
        <div class="nx-cart-right">
          <div class="section-title">Order Summary</div>

          <div class="nx-summary-card">
            <div class="summary-line"><span class="sl-label">Subtotal ({{totalQty}} items)</span><span class="sl-val">{{subtotal | currency}}</span></div>
            <div class="summary-line" *ngIf="discount > 0"><span class="sl-label">Discount (−{{discountPercent}}%)</span><span class="sl-val nx-green">−{{discount | currency}}</span></div>
            <div class="summary-line"><span class="sl-label">Shipping</span><span class="sl-val" [class.nx-green]="deliveryCost === 0">{{deliveryCost === 0 ? 'Free' : (deliveryCost | currency)}}</span></div>
            <div class="summary-line"><span class="sl-label">Tax (8%)</span><span class="sl-val">{{tax | currency}}</span></div>
            <div class="summary-divider"></div>
            <div class="nx-total-line">
              <span class="nx-total-label">Total</span>
              <span class="total-val">{{grandTotal | currency}}</span>
            </div>
          </div>

          <div class="nx-pay-title">Payment Method</div>
          <div class="nx-pay-methods">
            <div class="nx-pay-method" [class.active]="payMethod === 'card'" (click)="payMethod = 'card'">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.1"/><path d="M1 6h12" stroke="currentColor" stroke-width="1.1"/></svg>
              Card
            </div>
            <div class="nx-pay-method" [class.active]="payMethod === 'crypto'" (click)="payMethod = 'crypto'">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.1"/><path d="M4.5 7h5M7 4.5v5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>
              Crypto
            </div>
            <div class="nx-pay-method" [class.active]="payMethod === 'wallet'" (click)="payMethod = 'wallet'">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="4" width="10" height="6" rx="1.5" stroke="currentColor" stroke-width="1.1"/><path d="M5 4V3a2 2 0 0 1 4 0v1" stroke="currentColor" stroke-width="1.1"/></svg>
              Wallet
            </div>
          </div>

          <button class="nx-checkout-btn" (click)="goStep2()" [disabled]="cartItems.length === 0">Proceed to Payment →</button>

          <div class="nx-secure-note">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1L2 2.5v3c0 2.2 1.5 4 3.5 4.5C7.5 9.5 9 7.7 9 5.5v-3L5.5 1Z" stroke="#344844" stroke-width="1.1"/></svg>
            Secure checkout · 256-bit SSL
          </div>

          <div class="nx-trust-row">
            <div class="nx-trust-item">
              <div class="nx-trust-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9h12M9 3v12" stroke="#344844" stroke-width="1.2" stroke-linecap="round"/><rect x="2" y="2" width="14" height="14" rx="3" stroke="#344844" stroke-width="1.2"/></svg>
              </div>
              <div class="nx-trust-label">Free<br>Returns</div>
            </div>
            <div class="nx-trust-item">
              <div class="nx-trust-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L3 5v5c0 3.3 2.7 5.8 6 6.8 3.3-1 6-3.5 6-6.8V5L9 2Z" stroke="#344844" stroke-width="1.2"/></svg>
              </div>
              <div class="nx-trust-label">2 Year<br>Warranty</div>
            </div>
            <div class="nx-trust-item">
              <div class="nx-trust-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke="#344844" stroke-width="1.2"/><path d="M6 9l2 2 4-4" stroke="#344844" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div class="nx-trust-label">Verified<br>Products</div>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 2: PAYMENT GATEWAY -->
      <div class="nx-cart-main" *ngIf="step === 2">
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

          <!-- PAYMENT METHOD SELECTION -->
          <div class="section-title" style="margin-top:20px;margin-bottom:12px;">Payment Method</div>
          <div style="display:flex;gap:8px;margin-bottom:16px;">
            <div (click)="paymentMethod='card'" [style.border-color]="paymentMethod==='card' ? 'var(--teal)' : 'var(--border)'" style="flex:1;padding:12px;border:1.5px solid;border-radius:8px;cursor:pointer;text-align:center;background:var(--card);transition:border-color .2s;">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="margin-bottom:4px;"><rect x="2" y="5" width="14" height="9" rx="2" stroke="currentColor" stroke-width="1.1"/><path d="M2 8h14" stroke="currentColor" stroke-width="1.1"/></svg>
              <div style="font-size:10px;font-weight:500;">Credit Card</div>
            </div>
            <div (click)="paymentMethod='paypal'" [style.border-color]="paymentMethod==='paypal' ? 'var(--teal)' : 'var(--border)'" style="flex:1;padding:12px;border:1.5px solid;border-radius:8px;cursor:pointer;text-align:center;background:var(--card);transition:border-color .2s;">
              <div style="font-size:14px;font-weight:700;color:#0070BA;margin-bottom:4px;">P</div>
              <div style="font-size:10px;font-weight:500;">PayPal</div>
            </div>
            <div (click)="paymentMethod='bank'" [style.border-color]="paymentMethod==='bank' ? 'var(--teal)' : 'var(--border)'" style="flex:1;padding:12px;border:1.5px solid;border-radius:8px;cursor:pointer;text-align:center;background:var(--card);transition:border-color .2s;">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="margin-bottom:4px;"><path d="M9 2L2 7h14L9 2Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/><path d="M4 10v4M7 10v4M11 10v4M14 10v4M2 16h14" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>
              <div style="font-size:10px;font-weight:500;">Bank Transfer</div>
            </div>
          </div>

          <!-- CARD INPUT FIELDS -->
          <ng-container *ngIf="paymentMethod === 'card'">
          <div class="section-title" style="margin-bottom:12px;">Card Details</div>
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
          </ng-container>

          <!-- PAYPAL -->
          <ng-container *ngIf="paymentMethod === 'paypal'">
            <div style="text-align:center;padding:24px;background:var(--card);border:1px solid var(--border);border-radius:8px;">
              <div style="font-size:24px;font-weight:700;color:#0070BA;margin-bottom:8px;">PayPal</div>
              <div style="font-size:12px;color:var(--text3);margin-bottom:16px;">You will be redirected to PayPal to complete payment securely.</div>
              <input class="fi" placeholder="PayPal email address" [(ngModel)]="paypalEmail" style="max-width:300px;margin:0 auto;text-align:center;"/>
            </div>
          </ng-container>

          <!-- BANK TRANSFER -->
          <ng-container *ngIf="paymentMethod === 'bank'">
            <div style="padding:20px;background:var(--card);border:1px solid var(--border);border-radius:8px;">
              <div style="font-size:12px;font-weight:500;margin-bottom:12px;">Bank Transfer Details</div>
              <div style="font-size:11px;color:var(--text3);line-height:1.8;">
                <div><strong>Bank:</strong> SmartStore International Bank</div>
                <div><strong>IBAN:</strong> TR00 0000 0000 0000 0000 0000 00</div>
                <div><strong>SWIFT:</strong> SMSTSTXX</div>
                <div><strong>Reference:</strong> ORD-{{(Math.random() * 9999) | number:'1.0-0'}}</div>
              </div>
              <div style="margin-top:12px;font-size:10px;color:var(--teal);padding:8px;background:rgba(62,207,178,0.06);border-radius:6px;">
                Your order will be processed once payment is confirmed (1-2 business days).
              </div>
            </div>
          </ng-container>

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
            <div class="eta-val">{{estimatedDelivery}}</div>
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
          <button class="btn-ghost" routerLink="/consumer">
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
  orderService = inject(OrderService);
  auth = inject(AuthService);
  toast = inject(ToastService);

  // Cart Step 1 State
  couponCode = '';
  deliveryMethod = 'standard';
  deliveryCost = 0;
  payMethod = 'card';
  discount = 0;
  discountPercent = 0;

  Math = Math;
  paymentMethod = 'card';
  paypalEmail = '';

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

  get estimatedDelivery(): string {
    const d = new Date();
    d.setDate(d.getDate() + (this.deliveryMethod === 'sameday' ? 0 : this.deliveryMethod === 'express' ? 2 : 5));
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

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

  get totalQty(): number {
    return this.cartItems.reduce((acc, item) => acc + item.qty, 0);
  }

  get tax(): number {
    return (this.subtotal - this.discount) * 0.08;
  }

  get grandTotal(): number {
    return this.subtotal - this.discount + this.deliveryCost + this.tax;
  }

  applyCoupon() {
    if (this.couponCode.toUpperCase() === 'NEXUS20') {
      this.discountPercent = 20;
      this.discount = this.subtotal * 0.2;
      this.toast.show('Coupon applied! 20% off');
    } else if (this.couponCode.trim()) {
      this.toast.show('Invalid coupon code', 'error');
    }
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
    if (this.paymentMethod === 'card') {
      const cleanNum = this.rawNum.replace(/\s/g, '');
      let valid = true;
      if (cleanNum.length < 16) { this.numErr = true; valid = false; }
      if (this.rawExp.replace(/\D/g, '').length < 4) { this.expErr = true; valid = false; }
      if (this.rawCvv.length < 3) { this.cvvErr = true; valid = false; }
      if (!valid) return;
    } else if (this.paymentMethod === 'paypal' && !this.paypalEmail.includes('@')) {
      return;
    }

    this.isProcessing = true;
    
    const user = this.auth.currentUserValue;
    const orderPayload = {
      user: { userId: user?.userId || 1 },
      totalAmount: this.grandTotal,
      shippingAddress: "123 Nexus Grove, SF, CA",
      status: 'PENDING',
      items: this.cartItems.map(item => ({
        product: { productId: item.productId },
        quantity: item.qty,
        priceAtPurchase: item.basePrice
      }))
    };

    this.orderService.createOrder(orderPayload).subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.paySuccess = true;
        this.orderId = res.orderId;
        setTimeout(() => {
          this.step = 3;
          setTimeout(() => this.launchConfetti(), 100);
        }, 1500);
      },
      error: (err) => {
        this.isProcessing = false;
        this.toast.show('Failed to save order. Please try again.', 'error');
      }
    });
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

      <!-- REVIEWS SECTION -->
      <div class="gcard" style="padding:24px; margin-top:20px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
          <div style="font-family:'Playfair Display',serif; font-size:18px;">Customer Reviews</div>
          <div style="font-size:12px; color:var(--text3);" *ngIf="reviews.length > 0">{{reviews.length}} review{{reviews.length > 1 ? 's' : ''}} · Avg {{avgRating}}★</div>
        </div>
        <div *ngIf="reviews.length === 0" style="text-align:center; padding:24px; color:var(--text3); font-size:12px;">No reviews yet. Be the first to review this product!</div>
        <div *ngFor="let r of reviews" style="padding:14px 0; border-bottom:1px solid var(--border);">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:28px; height:28px; border-radius:50%; background:var(--teal-dim); display:flex; align-items:center; justify-content:center; font-size:11px; color:var(--teal); font-weight:600;">{{(r.user?.fullName || 'U').charAt(0)}}</div>
              <div style="font-size:12px; font-weight:500; color:var(--text);">{{r.user?.fullName || 'Anonymous'}}</div>
            </div>
            <div style="font-size:11px; color:var(--text3);">{{r.createdAt | date:'mediumDate'}}</div>
          </div>
          <div style="display:flex; gap:2px; margin-bottom:6px;">
            <span *ngFor="let s of [1,2,3,4,5]" style="font-size:12px;" [style.color]="s <= r.rating ? '#E8A94A' : 'var(--text3)'">★</span>
          </div>
          <div style="font-size:12px; color:var(--text2); line-height:1.5;">{{r.comment}}</div>
          <div *ngIf="r.sentimentScore != null" style="margin-top:6px;">
            <span style="font-size:9px; padding:2px 8px; border-radius:8px; letter-spacing:0.05em; text-transform:uppercase;"
              [style.background]="r.sentimentScore > 0.6 ? 'rgba(62,201,138,0.1)' : r.sentimentScore < 0.4 ? 'rgba(224,112,112,0.1)' : 'rgba(107,168,200,0.1)'"
              [style.color]="r.sentimentScore > 0.6 ? '#3EC98A' : r.sentimentScore < 0.4 ? '#E07070' : '#6BA8C8'">
              {{r.sentimentScore > 0.6 ? 'Positive' : r.sentimentScore < 0.4 ? 'Negative' : 'Neutral'}}
            </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  product: any;
  reviews: any[] = [];
  route = inject(ActivatedRoute);
  productService = inject(ProductService);

  get avgRating(): string {
    if (this.reviews.length === 0) return '0';
    const avg = this.reviews.reduce((s, r) => s + (r.rating || 0), 0) / this.reviews.length;
    return avg.toFixed(1);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productService.getProducts().subscribe(res => {
          this.product = res.find((p: any) => p.productId === +id);
        });
        this.productService.getReviews(+id).subscribe({
          next: (res) => this.reviews = res || [],
          error: () => this.reviews = []
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
        <div class="page-title">My Orders</div>
        <div class="page-sub">Purchase history & tracking</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="ripple-btn ghost" style="font-size:11px;padding:6px 16px;" (click)="exportOrders()">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v8M3 6l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 10h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
          Export CSV
        </button>
      </div>
    </div>
    <div class="app-content">

      <!-- PURCHASE HISTORY TABLE -->
      <div class="gcard" style="margin-bottom:24px;" *ngIf="myOrders.length > 0">
        <div class="gc-head"><div class="gc-title">Purchase History</div><div class="gc-link">{{myOrders.length}} orders</div></div>
        <div class="gc-body" style="padding:0;">
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead><tr style="border-bottom:1px solid var(--border);text-align:left;">
              <th style="padding:10px 16px;font-weight:500;color:var(--text3);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;">Order</th>
              <th style="padding:10px 12px;font-weight:500;color:var(--text3);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;">Date</th>
              <th style="padding:10px 12px;font-weight:500;color:var(--text3);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;">Amount</th>
              <th style="padding:10px 12px;font-weight:500;color:var(--text3);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;">Items</th>
              <th style="padding:10px 12px;font-weight:500;color:var(--text3);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;">Status</th>
            </tr></thead>
            <tbody>
              <tr *ngFor="let o of myOrders" style="border-bottom:1px solid var(--border);">
                <td style="padding:10px 16px;font-family:'JetBrains Mono',monospace;color:var(--teal);">#ORD-{{o.orderId}}</td>
                <td style="padding:10px 12px;color:var(--text2);">{{o.orderDate | date:'mediumDate'}}</td>
                <td style="padding:10px 12px;font-weight:500;">{{o.totalAmount | currency}}</td>
                <td style="padding:10px 12px;color:var(--text2);">{{o.items?.length || 0}} items</td>
                <td style="padding:10px 12px;">
                  <span style="font-size:10px;padding:3px 10px;border-radius:10px;font-weight:500;"
                    [style.background]="o.status === 'DELIVERED' ? 'rgba(62,201,138,0.1)' : o.status === 'PENDING' ? 'rgba(232,169,74,0.1)' : 'rgba(107,168,200,0.1)'"
                    [style.color]="o.status === 'DELIVERED' ? '#3EC98A' : o.status === 'PENDING' ? '#E8A94A' : '#6BA8C8'">
                    ● {{o.status}}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="myOrders.length === 0" class="gcard" style="padding:48px;text-align:center;color:var(--text3);">
        <div style="font-size:36px;margin-bottom:12px;opacity:0.2;">📦</div>
        <div style="font-size:13px;">No orders yet. Start shopping!</div>
      </div>

      <!-- SHIPMENT TRACKING (Dynamic per order) -->
      <div *ngIf="selectedOrder" style="margin-bottom:40px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);">Tracking: #ORD-{{selectedOrder.orderId}}</div>
          <select style="background:var(--glass);border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:11px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;" [(ngModel)]="selectedOrderId" (change)="onOrderSelect()">
            <option *ngFor="let o of myOrders" [value]="o.orderId">ORD-{{o.orderId}} — {{o.totalAmount | currency}}</option>
          </select>
        </div>
        <div class="progress-wrap">
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="trackingProgress"></div>
          </div>
          <div class="progress-labels">
            <span class="prog-label" [class.active]="isStepDone('PENDING')">Confirmed</span>
            <span class="prog-label" [class.active]="isStepDone('PROCESSING')">Processing</span>
            <span class="prog-label" [class.active]="isStepDone('SHIPPED')">Shipped</span>
            <span class="prog-label" [class.active]="isStepDone('IN_TRANSIT')">In Transit</span>
            <span class="prog-label" [class.active]="isStepDone('DELIVERED')">Delivered</span>
          </div>
        </div>
      </div>

      <div class="row2" *ngIf="selectedOrder">
        <div class="gcard" style="padding:22px;">
          <h3 style="font-family:'Playfair Display',serif;font-weight:400;font-style:italic;margin-bottom:20px;">Shipment Timeline</h3>
          <div class="timeline">
            <div class="tl-item done">
              <div class="tl-left"><div class="tl-dot done"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5l2.5 2.5 5-5" stroke="#3ECFB2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>
              <div class="tl-right"><div class="tl-title done">Order Confirmed <span class="tl-time">{{selectedOrder.orderDate | date:'shortTime'}}</span></div><div class="tl-desc">Payment verified. Order confirmed.</div></div>
            </div>
            <div class="tl-item" [class.done]="isStepDone('PROCESSING')" [class.idle]="!isStepDone('PROCESSING')">
              <div class="tl-left"><div class="tl-dot" [class.done]="isStepDone('PROCESSING')"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5l2.5 2.5 5-5" [attr.stroke]="isStepDone('PROCESSING') ? '#3ECFB2' : '#344844'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>
              <div class="tl-right"><div class="tl-title" [class.done]="isStepDone('PROCESSING')">Processing</div><div class="tl-desc">Items being packed at warehouse.</div></div>
            </div>
            <div class="tl-item" [class.done]="isStepDone('SHIPPED')" [class.active]="selectedOrder.status === 'SHIPPED'" [class.idle]="!isStepDone('SHIPPED')">
              <div class="tl-left"><div class="tl-dot" [class.done]="isStepDone('SHIPPED')" [class.active]="selectedOrder.status === 'SHIPPED'"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" [attr.stroke]="isStepDone('SHIPPED') ? '#3ECFB2' : '#344844'" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>
              <div class="tl-right"><div class="tl-title" [class.done]="isStepDone('SHIPPED')" [class.active]="selectedOrder.status === 'SHIPPED'">Shipped</div><div class="tl-desc">{{shipmentData?.carrier || 'Carrier'}} — {{shipmentData?.trackingNumber || 'Pending'}}</div></div>
            </div>
            <div class="tl-item" [class.done]="isStepDone('DELIVERED')" [class.idle]="!isStepDone('DELIVERED')">
              <div class="tl-left"><div class="tl-dot" [class.done]="isStepDone('DELIVERED')" [class.idle]="!isStepDone('DELIVERED')"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" [attr.stroke]="isStepDone('DELIVERED') ? '#3ECFB2' : '#344844'" stroke-width="1.1"/></svg></div></div>
              <div class="tl-right"><div class="tl-title" [class.done]="isStepDone('DELIVERED')">Delivered</div><div class="tl-desc">{{shipmentData?.deliveredAt ? (shipmentData.deliveredAt | date:'mediumDate') : (shipmentData?.estimatedDelivery ? 'Est. ' + (shipmentData.estimatedDelivery | date:'mediumDate') : 'Pending')}}</div></div>
            </div>
          </div>
        </div>

        <div>
          <div class="gcard tilt-card" style="padding:18px; margin-bottom:12px; background:var(--teal-dim); border-color:var(--teal-glow);">
            <div class="card-glow"></div>
            <div style="position:relative; z-index:2;">
              <div style="font-size:9.5px;letter-spacing:0.12em;text-transform:uppercase;color:var(--teal);margin-bottom:8px;">Estimated Delivery</div>
              <div style="font-family:'Playfair Display',serif;font-size:22px;margin-bottom:4px;">{{shipmentData?.estimatedDelivery ? (shipmentData.estimatedDelivery | date:'mediumDate') : 'Calculating...'}}</div>
              <div style="height:3px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:14px;overflow:hidden;"><div [style.width.%]="trackingProgress" style="height:100%;background:var(--teal);border-radius:2px;"></div></div>
            </div>
          </div>
          
          <div class="gcard" style="margin-bottom: 12px;">
            <div class="gc-head"><div class="gc-title">Carrier Info</div></div>
            <div class="gc-body" style="color:var(--text3); font-size:12px; line-height: 1.5;">
               <strong style="color:var(--text);">{{shipmentData?.carrier || 'Pending'}}</strong><br>
               Tracking: {{shipmentData?.trackingNumber || 'N/A'}}<br>
               Mode: {{shipmentData?.modeOfShipment || 'Standard'}}
            </div>
          </div>

          <div class="gcard" style="padding:22px; display:flex; flex-direction:column; align-items:center; gap:10px; background:rgba(62,207,178,0.03);">
             <h3 style="font-family:'Playfair Display',serif;font-weight:400;font-style:italic;">Got it already?</h3>
             <p style="font-size:11px;color:var(--text2);text-align:center;">If you received this part of your order, let us know how we did.</p>
             <button class="open-btn" (click)="openReviewForOrder(selectedOrder)" style="margin-top:4px;">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L8.6 5.2H13L9.7 7.8l1.3 4.2L7 9.5 2.9 12l1.3-4.2L1 5.2h4.4L7 1Z" stroke="#080808" stroke-width="1.2" stroke-linejoin="round"/></svg>
                Write a Review
             </button>
          </div>
        </div>
      </div>

      <div *ngIf="!selectedOrder && myOrders.length > 0" style="text-align:center;padding:24px;color:var(--text3);font-size:12px;">
        Select an order above to view tracking details.
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
export class OrdersComponent implements OnInit {
  isModalOpen = false;
  isSuccess = false;
  isSubmitting = false;
  rating = 0;
  hoverRating = 0;
  popStar = 0;
  reviewText = '';
  charCount = 0;
  myOrders: any[] = [];
  selectedOrder: any = null;
  selectedOrderId: number | null = null;
  shipmentData: any = null;
  reviewProductId: number | null = null;

  private statusOrder = ['PENDING','PROCESSING','SHIPPED','IN_TRANSIT','DELIVERED'];

  productService = inject(ProductService);
  orderService = inject(OrderService);
  shipmentService = inject(ShipmentService);
  auth = inject(AuthService);
  toast = inject(ToastService);

  ngOnInit() {
    this.orderService.getOrders().subscribe(orders => {
      this.myOrders = orders.sort((a: any, b: any) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      if (this.myOrders.length > 0) {
        this.selectedOrderId = this.myOrders[0].orderId;
        this.onOrderSelect();
      }
    });
  }

  onOrderSelect() {
    this.selectedOrder = this.myOrders.find(o => o.orderId == this.selectedOrderId) || null;
    this.shipmentData = null;
    if (this.selectedOrder) {
      this.shipmentService.getByOrder(this.selectedOrder.orderId).subscribe({
        next: (s: any) => this.shipmentData = s,
        error: () => this.shipmentData = null
      });
    }
  }

  get trackingProgress(): number {
    if (!this.selectedOrder) return 0;
    const status = this.shipmentData?.status || this.selectedOrder.status;
    const idx = this.statusOrder.indexOf(status);
    return idx >= 0 ? ((idx + 1) / this.statusOrder.length) * 100 : 20;
  }

  isStepDone(step: string): boolean {
    if (!this.selectedOrder) return false;
    const current = this.shipmentData?.status || this.selectedOrder.status;
    return this.statusOrder.indexOf(current) >= this.statusOrder.indexOf(step);
  }

  openReviewForOrder(order: any) {
    const firstItem = order?.items?.[0];
    this.reviewProductId = firstItem?.productId || firstItem?.product?.productId || null;
    this.isModalOpen = true;
  }

  exportOrders() {
    const csv = ['Order ID,Date,Amount,Status,Items']
      .concat(this.myOrders.map((o: any) =>
        `ORD-${o.orderId},${o.orderDate},${o.totalAmount},${o.status},${o.items?.length || 0}`
      )).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'orders.csv'; a.click();
    URL.revokeObjectURL(url);
    this.toast.show('Orders exported');
  }

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
    if (!this.canSubmit()) return;
    this.isSubmitting = true;
    
    const productId = this.reviewProductId || this.selectedOrder?.items?.[0]?.productId || 1;

    this.productService.submitReview(productId, this.rating, this.reviewText).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isSuccess = true;
        this.toast.show('Thank you for your feedback!');
      },
      error: () => {
        this.isSubmitting = false;
        this.toast.show('Failed to submit review', 'error');
      }
    });
  }
}
