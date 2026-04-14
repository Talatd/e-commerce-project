import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { getReviewsByProductId, getReviewStats, addReview } from '@/data/reviews';

export async function GET(request, { params }) {
    const authResult = authenticateRequest(request);
    if (authResult.error) return authResult.error;

    try {
        const { productId } = await params;
        const reviews = getReviewsByProductId(productId);
        const stats = getReviewStats(productId);

        return NextResponse.json({
            success: true,
            reviews,
            stats
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch reviews.' },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    const authResult = authenticateRequest(request);
    if (authResult.error) return authResult.error;
    const user = authResult.user;

    try {
        const { productId } = await params;
        const body = await request.json();
        const { rating, title, comment } = body;

        if (!rating || !title || !comment) {
            return NextResponse.json(
                { success: false, error: 'Rating, title, and comment are required.' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { success: false, error: 'Rating must be between 1 and 5.' },
                { status: 400 }
            );
        }

        const newReview = addReview(productId, {
            userId: `user_${user.id}`,
            userName: user.name,
            rating: parseInt(rating),
            title,
            comment
        });

        return NextResponse.json({
            success: true,
            review: newReview,
            message: 'Review added successfully!'
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to add review.' },
            { status: 500 }
        );
    }
}
