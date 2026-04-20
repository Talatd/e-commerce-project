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
];

export function pathWithoutQuery(url: string): string {
  const i = url.indexOf('?');
  const h = url.indexOf('#');
  let end = url.length;
  if (i >= 0) end = Math.min(end, i);
  if (h >= 0) end = Math.min(end, h);
  return url.slice(0, end);
}

export function isFullpageStandalonePath(url: string): boolean {
  return FULLPAGE_STANDALONE_PATHS.includes(pathWithoutQuery(url));
}
