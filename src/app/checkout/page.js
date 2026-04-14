"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './checkout.module.css';

export default function CheckoutPage() {
    const { user, loading, authFetch } = useAuth();
    const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();
    const router = useRouter();

    const [step, setStep] = useState('cart'); // 'cart' | 'payment' | 'success'
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    // Payment form state
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [cardName, setCardName] = useState('');

    // Order result
    const [orderResult, setOrderResult] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : v;
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setStep('payment');
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setPaymentLoading(true);
        setPaymentError('');

        try {
            // Create PaymentIntent via our API
            const res = await authFetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    currency: 'usd'
                }),
            });

            if (!res) return;
            const data = await res.json();

            if (data.success) {
                // Simulate successful payment processing
                // In production with real Stripe keys, you'd use Stripe Elements here
                setOrderResult({
                    orderId: 'ORD-' + Date.now().toString(36).toUpperCase(),
                    amount: data.amount,
                    currency: data.currency,
                    items: [...cart],
                    date: new Date().toLocaleString(),
                    paymentIntentId: data.paymentIntentId,
                    demo: data.demo || false
                });
                setStep('success');
                clearCart();
            } else {
                setPaymentError(data.error || 'Payment failed. Please try again.');
            }
        } catch (error) {
            setPaymentError('Connection error. Please try again.');
        } finally {
            setPaymentLoading(false);
        }
    };

    if (loading || !user) {
        return (
            <div className={styles.loadingScreen}>
                <div className={styles.loader}></div>
            </div>
        );
    }

    return (
        <div className={styles.checkoutPage}>
            {/* Progress Steps */}
            <div className={styles.progressBar}>
                <div className={`${styles.progressStep} ${step === 'cart' || step === 'payment' || step === 'success' ? styles.progressStepActive : ''}`}>
                    <div className={styles.stepCircle}>
                        {step === 'payment' || step === 'success' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : '1'}
                    </div>
                    <span>Cart</span>
                </div>
                <div className={styles.progressLine}></div>
                <div className={`${styles.progressStep} ${step === 'payment' || step === 'success' ? styles.progressStepActive : ''}`}>
                    <div className={styles.stepCircle}>
                        {step === 'success' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : '2'}
                    </div>
                    <span>Payment</span>
                </div>
                <div className={styles.progressLine}></div>
                <div className={`${styles.progressStep} ${step === 'success' ? styles.progressStepActive : ''}`}>
                    <div className={styles.stepCircle}>3</div>
                    <span>Confirmation</span>
                </div>
            </div>

            {/* Cart Step */}
            {step === 'cart' && (
                <div className={styles.cartSection}>
                    <h1 className={styles.pageTitle}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Shopping Cart
                        <span className={styles.cartBadge}>{cartCount} items</span>
                    </h1>

                    {cart.length === 0 ? (
                        <div className={styles.emptyCart}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            <h3>Your cart is empty</h3>
                            <p>Add some products to get started!</p>
                            <Link href="/products" className="btn btn-primary btn-lg">
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.cartLayout}>
                            <div className={styles.cartItems}>
                                {cart.map((item) => (
                                    <div key={item.id} className={styles.cartItem}>
                                        <div className={styles.itemImagePlaceholder}>
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                                <line x1="12" y1="17" x2="12" y2="21"></line>
                                            </svg>
                                        </div>
                                        <div className={styles.itemInfo}>
                                            <span className={styles.itemBrand}>{item.brand}</span>
                                            <h3 className={styles.itemName}>{item.name}</h3>
                                            <div className={styles.itemPricing}>
                                                <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
                                                {item.originalPrice && (
                                                    <span className={styles.itemOriginalPrice}>${item.originalPrice.toFixed(2)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.itemActions}>
                                            <div className={styles.quantityControl}>
                                                <button
                                                    className={styles.qtyBtn}
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >−</button>
                                                <span className={styles.qtyValue}>{item.quantity}</span>
                                                <button
                                                    className={styles.qtyBtn}
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >+</button>
                                            </div>
                                            <span className={styles.itemSubtotal}>
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                            <button
                                                className={styles.removeBtn}
                                                onClick={() => removeFromCart(item.id)}
                                                aria-label="Remove item"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.orderSummary}>
                                <h3 className={styles.summaryTitle}>Order Summary</h3>
                                <div className={styles.summaryRow}>
                                    <span>Subtotal ({cartCount} items)</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Shipping</span>
                                    <span className={styles.freeShipping}>FREE</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Tax (estimated)</span>
                                    <span>${(cartTotal * 0.08).toFixed(2)}</span>
                                </div>
                                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                                    <span>Total</span>
                                    <span>${(cartTotal * 1.08).toFixed(2)}</span>
                                </div>

                                <button
                                    className={`btn btn-primary btn-lg ${styles.checkoutBtn}`}
                                    onClick={handleCheckout}
                                    id="proceed-to-payment"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                        <line x1="1" y1="10" x2="23" y2="10"></line>
                                    </svg>
                                    Proceed to Payment
                                </button>

                                <div className={styles.securityNote}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    Secure checkout powered by Stripe
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Payment Step */}
            {step === 'payment' && (
                <div className={styles.paymentSection}>
                    <h1 className={styles.pageTitle}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                            <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                        Payment Details
                    </h1>

                    <div className={styles.paymentLayout}>
                        <form className={styles.paymentForm} onSubmit={handlePayment}>
                            <div className={styles.stripeInfo}>
                                <div className={styles.stripeLogo}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </div>
                                <div>
                                    <strong>Stripe Test Mode</strong>
                                    <p>Use card number <code>4242 4242 4242 4242</code> for testing</p>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="card-name">Cardholder Name</label>
                                <input
                                    id="card-name"
                                    type="text"
                                    className={styles.formInput}
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="card-number">Card Number</label>
                                <input
                                    id="card-number"
                                    type="text"
                                    className={styles.formInput}
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                    placeholder="4242 4242 4242 4242"
                                    maxLength="19"
                                    required
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="card-expiry">Expiry Date</label>
                                    <input
                                        id="card-expiry"
                                        type="text"
                                        className={styles.formInput}
                                        value={cardExpiry}
                                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                        placeholder="MM/YY"
                                        maxLength="5"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="card-cvc">CVC</label>
                                    <input
                                        id="card-cvc"
                                        type="text"
                                        className={styles.formInput}
                                        value={cardCvc}
                                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                                        placeholder="123"
                                        maxLength="4"
                                        required
                                    />
                                </div>
                            </div>

                            {paymentError && (
                                <div className={styles.errorMessage}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                    </svg>
                                    {paymentError}
                                </div>
                            )}

                            <div className={styles.paymentActions}>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-lg"
                                    onClick={() => setStep('cart')}
                                    disabled={paymentLoading}
                                >
                                    ← Back to Cart
                                </button>
                                <button
                                    type="submit"
                                    className={`btn btn-primary btn-lg ${styles.payBtn}`}
                                    disabled={paymentLoading}
                                    id="pay-now-btn"
                                >
                                    {paymentLoading ? (
                                        <>
                                            <span className={styles.spinner}></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                            </svg>
                                            Pay ${(cartTotal * 1.08).toFixed(2)}
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className={styles.testCards}>
                                <h4>Test Card Numbers:</h4>
                                <div className={styles.testCardList}>
                                    <div className={styles.testCard}>
                                        <code>4242 4242 4242 4242</code>
                                        <span>Visa (Success)</span>
                                    </div>
                                    <div className={styles.testCard}>
                                        <code>5555 5555 5555 4444</code>
                                        <span>Mastercard (Success)</span>
                                    </div>
                                    <div className={styles.testCard}>
                                        <code>4000 0000 0000 0002</code>
                                        <span>Card Declined</span>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className={styles.paymentSummary}>
                            <h3 className={styles.summaryTitle}>Order Summary</h3>
                            {cart.map(item => (
                                <div key={item.id} className={styles.summaryItem}>
                                    <span>{item.name} × {item.quantity}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className={styles.summaryDivider}></div>
                            <div className={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Shipping</span>
                                <span className={styles.freeShipping}>FREE</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Tax</span>
                                <span>${(cartTotal * 0.08).toFixed(2)}</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                                <span>Total</span>
                                <span>${(cartTotal * 1.08).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Step */}
            {step === 'success' && orderResult && (
                <div className={styles.successSection}>
                    <div className={styles.successCard}>
                        <div className={styles.successIcon}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <h1 className={styles.successTitle}>Payment Successful!</h1>
                        <p className={styles.successSubtitle}>Thank you for your order</p>

                        {orderResult.demo && (
                            <div className={styles.demoNote}>
                                ⚠️ This was a demo payment. Configure Stripe test keys for real payment processing.
                            </div>
                        )}

                        <div className={styles.orderDetails}>
                            <div className={styles.detailRow}>
                                <span>Order ID</span>
                                <strong>{orderResult.orderId}</strong>
                            </div>
                            <div className={styles.detailRow}>
                                <span>Date</span>
                                <strong>{orderResult.date}</strong>
                            </div>
                            <div className={styles.detailRow}>
                                <span>Payment ID</span>
                                <strong>{orderResult.paymentIntentId}</strong>
                            </div>
                            <div className={styles.detailRow}>
                                <span>Amount Paid</span>
                                <strong className={styles.amountPaid}>
                                    ${(orderResult.amount * 1.08).toFixed(2)} {orderResult.currency.toUpperCase()}
                                </strong>
                            </div>
                        </div>

                        <div className={styles.orderItems}>
                            <h4>Items Ordered</h4>
                            {orderResult.items.map(item => (
                                <div key={item.id} className={styles.orderedItem}>
                                    <span>{item.name}</span>
                                    <span>× {item.quantity} — ${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.successActions}>
                            <Link href="/products" className="btn btn-primary btn-lg">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
