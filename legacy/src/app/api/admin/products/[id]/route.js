import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { updateProduct, deleteProduct } from '@/data/products';

// PUT - Update product (admin only)
export async function PUT(request, { params }) {
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
        const { id } = await params;
        const updates = await request.json();
        const product = updateProduct(id, updates);

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            product,
            message: 'Product updated successfully!'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to update product.' },
            { status: 500 }
        );
    }
}

// DELETE - Remove product (admin only)
export async function DELETE(request, { params }) {
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
        const { id } = await params;
        const deleted = deleteProduct(id);

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: 'Product not found.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully!'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to delete product.' },
            { status: 500 }
        );
    }
}
