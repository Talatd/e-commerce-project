import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia',
});

export async function POST(request) {
    const authResult = authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    try {
        const { items, currency = 'usd' } = await request.json();

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Cart items are required.' },
                { status: 400 }
            );
        }

        // Calculate the total amount
        const amount = Math.round(
            items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
        ); // Convert to cents

        if (amount <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid cart total.' },
                { status: 400 }
            );
        }

        // Check if Stripe key is configured
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_YOUR_KEY_HERE') {
            // Demo mode - simulate successful payment
            return NextResponse.json({
                success: true,
                demo: true,
                clientSecret: 'demo_secret_' + Date.now(),
                paymentIntentId: 'pi_demo_' + Date.now(),
                amount: amount / 100,
                currency,
                message: '⚠️ Stripe is in demo mode. Add your test API key to .env.local to process real test payments.'
            });
        }

        // Create a PaymentIntent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata: {
                userId: user.id.toString(),
                userName: user.name,
                itemCount: items.length.toString(),
                items: JSON.stringify(items.map(i => ({ id: i.id, name: i.name, qty: i.quantity }))).substring(0, 500)
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return NextResponse.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: amount / 100,
            currency
        });

    } catch (error) {
        console.error('Stripe Checkout Error:', error);

        if (error.type === 'StripeAuthenticationError') {
            return NextResponse.json(
                { success: false, error: 'Stripe API key is invalid. Please check your configuration.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to create payment. Please try again.' },
            { status: 500 }
        );
    }
}
