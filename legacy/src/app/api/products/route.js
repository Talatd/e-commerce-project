import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { getAllProducts } from '@/data/products';

export async function GET(request) {
    const authResult = authenticateRequest(request);
    if (authResult.error) return authResult.error;

    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const category = searchParams.get('category');
        const sort = searchParams.get('sort');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');

        // All users see ALL products (this is an e-commerce store)
        let results = [...getAllProducts()];

        // Search filter
        if (query) {
            const q = query.toLowerCase();
            results = results.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                p.tags.some(t => t.toLowerCase().includes(q))
            );
        }

        // Category filter
        if (category && category !== 'all') {
            results = results.filter(p => p.category === category);
        }

        // Price filter
        if (minPrice) {
            results = results.filter(p => p.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            results = results.filter(p => p.price <= parseFloat(maxPrice));
        }

        // Sorting
        if (sort) {
            switch (sort) {
                case 'price-asc':
                    results.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    results.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    results.sort((a, b) => b.rating - a.rating);
                    break;
                case 'name':
                    results.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'newest':
                    results.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                    break;
            }
        }

        const allProducts = getAllProducts();
        const categories = [...new Set(allProducts.map(p => p.category))];
        const brands = [...new Set(allProducts.map(p => p.brand))];

        return NextResponse.json({
            success: true,
            products: results,
            total: results.length,
            categories,
            brands
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch products.' },
            { status: 500 }
        );
    }
}
