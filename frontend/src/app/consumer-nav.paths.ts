/**
 * Canonical consumer shopping URLs — use for routerLink / navigate
 * so Cart, Settings shell, and /consumer stay aligned with app.html mag-pills.
 */
export const CONSUMER_NAV = {
  shop: '/consumer',
  cart: '/cart',
  orders: '/orders',
  settings: '/settings',
} as const;

/** Routes that use full-page standalone chrome (no main app navbar shell). */
export const FULLPAGE_STANDALONE_PATHS: readonly string[] = [
  '/',
  '/login',
  '/admin',
  '/manager',
  CONSUMER_NAV.shop,
  CONSUMER_NAV.settings,
  CONSUMER_NAV.cart,
  CONSUMER_NAV.orders,
];

export function pathWithoutQuery(url: string): string {
  const i = url.indexOf('?');
  const h = url.indexOf('#');
  let end = url.length;
  if (i >= 0) end = Math.min(end, i);
  if (h >= 0) end = Math.min(end, h);
  return url.slice(0, end);
}

/** Product detail uses the same standalone chrome as cart/orders (see shop-pages). */
export function isFullpageStandalonePath(url: string): boolean {
  const p = pathWithoutQuery(url);
  if (FULLPAGE_STANDALONE_PATHS.includes(p)) return true;
  return p.startsWith('/product/');
}
