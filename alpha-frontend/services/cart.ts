export type CartItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

const CART_KEY = "cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  return JSON.parse(
    window.localStorage.getItem(CART_KEY) || "[]"
  );
}

export function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );
}

export function addToCart(item: CartItem) {
  const cart = getCart();

  const existingItem = cart.find(
    (cartItem) => cartItem.productId === item.productId
  );

  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  saveCart(cart);

  window.dispatchEvent(new Event("cart-updated"));

  return cart;
}

export function removeFromCart(productId: string) {
  const cart = getCart().filter(
    (item) => item.productId !== productId
  );

  saveCart(cart);

  window.dispatchEvent(new Event("cart-updated"));

  return cart;
}

export function clearCart() {
  saveCart([]);

  window.dispatchEvent(new Event("cart-updated"));
}