import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { getAllProducts, addProduct } from '@/data/products';

// GET all products (admin only)
export async function GET(request) {
    const authResult = authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    if (user.role !== 'admin') {
        return NextResponse.json(
            { success: false, error: 'Admin access required.' },
            { status: 403 }
        );
    }

    const products = getAllProducts();
    return NextResponse.json({ success: true, products });
}

// POST - Add new product (admin only)
export async function POST(request) {
    const authResult = authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    if (user.role !== 'admin') {
        return NextResponse.json(
            { success: false, error: 'Admin access required.' },
            { status: 403 }
        );
    }

    try {
        const body = await request.json();

        if (!body.name || !body.price) {
            return NextResponse.json(
                { success: false, error: 'Product name and price are required.' },
                { status: 400 }
            );
        }

        const product = addProduct({
            ...body,
            ownerId: user.id
        });

        return NextResponse.json({
            success: true,
            product,
            message: 'Product added successfully!'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to add product.' },
            { status: 500 }
        );
    }
}
