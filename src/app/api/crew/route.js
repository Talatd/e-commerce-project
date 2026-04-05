import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { getProductsByUser } from '@/data/products';

const CREW_BACKEND_URL = process.env.CREW_BACKEND_URL || 'http://localhost:5000';

export async function POST(request) {
    // Authenticate the request
    const authResult = authenticateRequest(request);
    if (!authResult.authenticated) {
        return NextResponse.json(
            { success: false, error: authResult.error },
            { status: authResult.status }
        );
    }

    try {
        const { task_type, customer_query } = await request.json();

        // Get user-specific products only
        const userProducts = getProductsByUser(authResult.user.id);
        const productCatalog = userProducts.map(p => ({
            name: p.name,
            brand: p.brand,
            category: p.category,
            price: p.price,
            originalPrice: p.originalPrice,
            rating: p.rating,
            reviews: p.reviews,
            description: p.description,
            tags: p.tags,
        }));

        // Call the CrewAI Flask backend
        const crewResponse = await fetch(`${CREW_BACKEND_URL}/api/crew/kickoff`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_catalog: productCatalog,
                customer_query: customer_query || '',
                task_type: task_type || 'all',
            }),
        });

        if (!crewResponse.ok) {
            const errorData = await crewResponse.json();
            return NextResponse.json(
                { success: false, error: errorData.error || 'CrewAI backend error' },
                { status: 502 }
            );
        }

        const result = await crewResponse.json();

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error('CrewAI proxy error:', error);

        // Check if it's a connection error
        if (error.cause && error.cause.code === 'ECONNREFUSED') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'CrewAI backend is not running. Start it with: cd crewai-backend && python app.py',
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to process CrewAI request' },
            { status: 500 }
        );
    }
}
