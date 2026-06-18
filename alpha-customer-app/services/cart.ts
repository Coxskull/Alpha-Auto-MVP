export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

const CART_KEY = "alpha-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(CART_KEY);

  return data ? JSON.parse(data) : [];
}

export function addToCart(item: CartItem) {
  const cart = getCart();

  const existing = cart.find(
    (x) => x.productId === item.productId
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(item);
  }

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );
}

export function removeFromCart(productId: string) {
  const cart = getCart().filter(
    (x) => x.productId !== productId
  );

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}