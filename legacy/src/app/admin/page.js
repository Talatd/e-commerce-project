"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminPage() {
    const { user, loading, authFetch } = useAuth();
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('dashboard');

    // Edit modal
    const [editProduct, setEditProduct] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Add modal
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState({
        name: '', brand: '', price: '', originalPrice: '',
        category: 'Electronics', subcategory: '', stock: '',
        description: '', tags: '', image: '', sku: ''
    });

    // Notifications
    const [notification, setNotification] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/products');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user && user.role === 'admin' && authFetch) {
            fetchProducts();
        }
    }, [user, authFetch]);

    const fetchProducts = async () => {
        try {
            const res = await authFetch('/api/admin/products');
            if (!res) return;
            const data = await res.json();
            if (data.success) setProducts(data.products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const showNotif = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(''), 3000);
    };

    // ADD Product
    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await authFetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...addForm,
                    tags: addForm.tags ? addForm.tags.split(',').map(t => t.trim()) : [],
                    images: addForm.image ? [addForm.image] : []
                }),
            });
            if (!res) return;
            const data = await res.json();
            if (data.success) {
                showNotif('✅ Product added successfully!');
                setShowAddForm(false);
                setAddForm({
                    name: '', brand: '', price: '', originalPrice: '',
                    category: 'Electronics', subcategory: '', stock: '',
                    description: '', tags: '', image: '', sku: ''
                });
                fetchProducts();
            }
        } catch (error) {
            showNotif('❌ Failed to add product');
        }
    };

    // EDIT Product
    const openEdit = (product) => {
        setEditProduct(product);
        setEditForm({
            name: product.name,
            brand: product.brand,
            price: product.price,
            originalPrice: product.originalPrice || '',
            category: product.category,
            subcategory: product.subcategory,
            stock: product.stock,
            description: product.description,
            tags: product.tags.join(', '),
            image: product.image,
            sku: product.sku
        });
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await authFetch(`/api/admin/products/${editProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editForm,
                    tags: editForm.tags ? editForm.tags.split(',').map(t => t.trim()) : [],
                    images: editForm.image ? [editForm.image] : editProduct.images
                }),
            });
            if (!res) return;
            const data = await res.json();
            if (data.success) {
                showNotif('✅ Product updated successfully!');
                setEditProduct(null);
                fetchProducts();
            }
        } catch (error) {
            showNotif('❌ Failed to update product');
        }
    };

    // DELETE Product
    const handleDeleteProduct = async (id) => {
        try {
            const res = await authFetch(`/api/admin/products/${id}`, {
                method: 'DELETE',
            });
            if (!res) return;
            const data = await res.json();
            if (data.success) {
                showNotif('🗑️ Product deleted successfully!');
                setDeleteConfirm(null);
                fetchProducts();
            }
        } catch (error) {
            showNotif('❌ Failed to delete product');
        }
    };

    if (loading || !user) {
        return <div className={styles.loadingScreen}><div className={styles.loader}></div></div>;
    }

    // Stats
    const totalProducts = products.length;
    const totalRevenue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockCount = products.filter(p => p.stock < 20).length;

    return (
        <div className={styles.adminPage}>
            {/* Notification */}
            {notification && (
                <div className={styles.notification}>{notification}</div>
            )}

            {/* Header */}
            <div className={styles.adminHeader}>
                <div className={styles.adminHeaderLeft}>
                    <Link href="/products" className={styles.backLink}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Back to Store
                    </Link>
                    <h1 className={styles.adminTitle}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        Admin Panel
                        <span className={styles.adminBadge}>ADMIN</span>
                    </h1>
                </div>
                <div className={styles.adminNav}>
                    <button className={`${styles.navTab} ${activeSection === 'dashboard' ? styles.navTabActive : ''}`} onClick={() => setActiveSection('dashboard')}>
                        📊 Dashboard
                    </button>
                    <button className={`${styles.navTab} ${activeSection === 'products' ? styles.navTabActive : ''}`} onClick={() => setActiveSection('products')}>
                        📦 Products
                    </button>
                </div>
            </div>

            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
                <div className={styles.dashboardSection}>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: 'rgba(108, 92, 231, 0.15)', color: '#a29bfe' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{totalProducts}</span>
                                <span className={styles.statLabel}>Total Products</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: 'rgba(0, 184, 148, 0.15)', color: '#55efc4' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>${totalRevenue.toLocaleString()}</span>
                                <span className={styles.statLabel}>Inventory Value</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: 'rgba(9, 132, 227, 0.15)', color: '#74b9ff' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{totalStock.toLocaleString()}</span>
                                <span className={styles.statLabel}>Total Stock</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: 'rgba(214, 48, 49, 0.15)', color: '#ff7675' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{lowStockCount}</span>
                                <span className={styles.statLabel}>Low Stock Items</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Products */}
                    <div className={styles.recentSection}>
                        <h3>Recent Products</h3>
                        <div className={styles.recentList}>
                            {products.slice(0, 5).map(p => (
                                <div key={p.id} className={styles.recentItem}>
                                    <div className={styles.recentIcon}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                                    </div>
                                    <div className={styles.recentInfo}>
                                        <span className={styles.recentName}>{p.name}</span>
                                        <span className={styles.recentMeta}>{p.brand} · {p.category}</span>
                                    </div>
                                    <span className={styles.recentPrice}>${p.price.toFixed(2)}</span>
                                    <span className={`${styles.stockBadge} ${p.stock < 20 ? styles.stockLow : styles.stockOk}`}>
                                        {p.stock} in stock
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Products Section */}
            {activeSection === 'products' && (
                <div className={styles.productsSection}>
                    <div className={styles.productsSectionHeader}>
                        <h2>Product Management</h2>
                        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Add Product
                        </button>
                    </div>

                    {isLoading ? (
                        <div className={styles.loadingScreen}><div className={styles.loader}></div></div>
                    ) : (
                        <div className={styles.productsTable}>
                            <div className={styles.tableHeader}>
                                <span className={styles.colId}>#</span>
                                <span className={styles.colName}>Product</span>
                                <span className={styles.colCategory}>Category</span>
                                <span className={styles.colPrice}>Price</span>
                                <span className={styles.colStock}>Stock</span>
                                <span className={styles.colRating}>Rating</span>
                                <span className={styles.colActions}>Actions</span>
                            </div>
                            {products.map(product => (
                                <div key={product.id} className={styles.tableRow}>
                                    <span className={styles.colId}>{product.id}</span>
                                    <div className={styles.colName}>
                                        <div>
                                            <div className={styles.productRowName}>{product.name}</div>
                                            <div className={styles.productRowBrand}>{product.brand} · SKU: {product.sku}</div>
                                        </div>
                                    </div>
                                    <span className={styles.colCategory}>
                                        <span className={styles.categoryChip}>{product.category}</span>
                                    </span>
                                    <span className={styles.colPrice}>
                                        <strong>${product.price.toFixed(2)}</strong>
                                        {product.originalPrice && (
                                            <small className={styles.strikePrice}>${product.originalPrice.toFixed(2)}</small>
                                        )}
                                    </span>
                                    <span className={`${styles.colStock} ${product.stock < 20 ? styles.stockLow : ''}`}>
                                        {product.stock}
                                    </span>
                                    <span className={styles.colRating}>
                                        ★ {product.rating}
                                    </span>
                                    <div className={styles.colActions}>
                                        <button className={styles.editBtn} onClick={() => openEdit(product)} title="Edit">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(product)} title="Delete">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add Product Modal */}
            {showAddForm && (
                <div className={styles.modalOverlay} onClick={() => setShowAddForm(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>➕ Add New Product</h2>
                            <button className={styles.modalClose} onClick={() => setShowAddForm(false)}>✕</button>
                        </div>
                        <form onSubmit={handleAddProduct} className={styles.modalForm}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Product Name *</label>
                                    <input type="text" required value={addForm.name}
                                        onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="e.g. Wireless Headphones" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Brand</label>
                                    <input type="text" value={addForm.brand}
                                        onChange={e => setAddForm(f => ({ ...f, brand: e.target.value }))}
                                        placeholder="e.g. SoundMax" />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Price ($) *</label>
                                    <input type="number" step="0.01" required value={addForm.price}
                                        onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))}
                                        placeholder="299.99" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Original Price ($)</label>
                                    <input type="number" step="0.01" value={addForm.originalPrice}
                                        onChange={e => setAddForm(f => ({ ...f, originalPrice: e.target.value }))}
                                        placeholder="399.99" />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Category</label>
                                    <select value={addForm.category}
                                        onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}>
                                        <option>Electronics</option>
                                        <option>Wearables</option>
                                        <option>Smart Home</option>
                                        <option>Accessories</option>
                                        <option>Computers</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Subcategory</label>
                                    <input type="text" value={addForm.subcategory}
                                        onChange={e => setAddForm(f => ({ ...f, subcategory: e.target.value }))}
                                        placeholder="e.g. Audio" />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Stock</label>
                                    <input type="number" value={addForm.stock}
                                        onChange={e => setAddForm(f => ({ ...f, stock: e.target.value }))}
                                        placeholder="50" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>SKU</label>
                                    <input type="text" value={addForm.sku}
                                        onChange={e => setAddForm(f => ({ ...f, sku: e.target.value }))}
                                        placeholder="SM-XX-001" />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Image URL</label>
                                <input type="text" value={addForm.image}
                                    onChange={e => setAddForm(f => ({ ...f, image: e.target.value }))}
                                    placeholder="https://example.com/image.jpg" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea value={addForm.description} rows={3}
                                    onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Product description..." />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Tags (comma separated)</label>
                                <input type="text" value={addForm.tags}
                                    onChange={e => setAddForm(f => ({ ...f, tags: e.target.value }))}
                                    placeholder="wireless, bluetooth, premium" />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {editProduct && (
                <div className={styles.modalOverlay} onClick={() => setEditProduct(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>✏️ Edit Product</h2>
                            <button className={styles.modalClose} onClick={() => setEditProduct(null)}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateProduct} className={styles.modalForm}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Product Name</label>
                                    <input type="text" required value={editForm.name}
                                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Brand</label>
                                    <input type="text" value={editForm.brand}
                                        onChange={e => setEditForm(f => ({ ...f, brand: e.target.value }))} />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Price ($)</label>
                                    <input type="number" step="0.01" required value={editForm.price}
                                        onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Original Price ($)</label>
                                    <input type="number" step="0.01" value={editForm.originalPrice}
                                        onChange={e => setEditForm(f => ({ ...f, originalPrice: e.target.value }))} />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Category</label>
                                    <select value={editForm.category}
                                        onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                                        <option>Electronics</option>
                                        <option>Wearables</option>
                                        <option>Smart Home</option>
                                        <option>Accessories</option>
                                        <option>Computers</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Subcategory</label>
                                    <input type="text" value={editForm.subcategory}
                                        onChange={e => setEditForm(f => ({ ...f, subcategory: e.target.value }))} />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Stock</label>
                                    <input type="number" value={editForm.stock}
                                        onChange={e => setEditForm(f => ({ ...f, stock: e.target.value }))} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>SKU</label>
                                    <input type="text" value={editForm.sku}
                                        onChange={e => setEditForm(f => ({ ...f, sku: e.target.value }))} />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Image URL</label>
                                <input type="text" value={editForm.image}
                                    onChange={e => setEditForm(f => ({ ...f, image: e.target.value }))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea value={editForm.description} rows={3}
                                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Tags (comma separated)</label>
                                <input type="text" value={editForm.tags}
                                    onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))} />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className="btn btn-secondary" onClick={() => setEditProduct(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
                    <div className={`${styles.modal} ${styles.modalSmall}`} onClick={e => e.stopPropagation()}>
                        <div className={styles.deleteConfirmContent}>
                            <div className={styles.deleteIcon}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            </div>
                            <h3>Delete Product?</h3>
                            <p>Are you sure you want to delete <strong>&quot;{deleteConfirm.name}&quot;</strong>? This action cannot be undone.</p>
                            <div className={styles.modalActions}>
                                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                <button className={`btn ${styles.deleteBtnConfirm}`} onClick={() => handleDeleteProduct(deleteConfirm.id)}>
                                    Delete Product
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
