"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createOrder } from "@/services/orders";
import { clearCart, getCart } from "@/services/cart";
import PaymentSelector from "@/components/PaymentSelector";

import { createPayment } from "@/services/paymentService";
type CountryCode = "PH" | "MX" | "US";
type CurrencyCode = "PHP" | "MXN" | "USD";
type PaymentGateway =
  | "cash"
  | "paymongo_gcash"
  | "paypal"
  | "stripe"
  | "maya"
  | "xendit"
  | "hitpay";

type CartItem = {
  productId: string;
  productName: string;
  price: number | string;
  quantity: number;
};

type CreateOrderResponse = {
  id?: string;
  order?: {
    id?: string;
    orderNumber?: string;
  };
  payment?: {
    id?: string;
    paymentMethod?: string;
    paymentGateway?: string | null;
    paymentStatus?: string;
    requiresRedirect?: boolean;
  };
  financial?: {
    currency?: string;
    itemSubtotal?: number;
    deliveryFee?: number;
    serviceFee?: number;
    tax?: number;
    discount?: number;
    totalAmount?: number;
  };
};

const COUNTRY_SETTINGS: Record<
  CountryCode,
  {
    name: string;
    currency: CurrencyCode;
    zone: string;
    deliveryFee: number;
    serviceFee: number;
    estimatedTaxRate: number;
  }
> = {
  PH: {
    name: "Philippines",
    currency: "PHP",
    zone: "Metro Manila",
    deliveryFee: 100,
    serviceFee: 50,
    estimatedTaxRate: 0.12,
  },
  MX: {
    name: "Mexico",
    currency: "MXN",
    zone: "34",
    deliveryFee: 8,
    serviceFee: 3,
    estimatedTaxRate: 0.16,
  },
  US: {
    name: "United States",
    currency: "USD",
    zone: "",
    deliveryFee: 8,
    serviceFee: 3,
    estimatedTaxRate: 0,
  },
};

function formatCurrency(
  amount: number,
  currency: CurrencyCode
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as {
      response?: {
        data?:
          | string
          | {
              message?: string;
              error?: string;
            };
      };
    };

    const responseData = axiosError.response?.data;

    if (typeof responseData === "string") {
      return responseData;
    }

    if (responseData?.message) {
      return responseData.message;
    }

    if (responseData?.error) {
      return responseData.error;
    }
  }

  return "Failed to create order.";
}

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [selectedCountry, setSelectedCountry] =
    useState<CountryCode>("MX");

  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyCode>("MXN");
const [gateway, setGateway] =
    useState<PaymentGateway>("cash");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
useEffect(() => {
  let cancelled = false;

  async function loadCart() {
    /*
     * Move the state updates into an asynchronous callback so they
     * are not executed synchronously inside the effect body.
     */
    await Promise.resolve();

    if (cancelled) {
      return;
    }

    try {
      const storedCart = getCart() as CartItem[];

      setCart(
        Array.isArray(storedCart)
          ? storedCart
          : []
      );
    } catch (cartError) {
      console.error(
        "Unable to load cart:",
        cartError
      );

      setCart([]);
    } finally {
      setCartLoaded(true);
    }
  }

  void loadCart();

  return () => {
    cancelled = true;
  };
}, []);

  const countrySettings = COUNTRY_SETTINGS[selectedCountry];

  const zone = countrySettings.zone;
  const deliveryFee = countrySettings.deliveryFee;
  const serviceFee = countrySettings.serviceFee;

  const itemDescription = useMemo(() => {
    return cart
      .map((item) => {
        return `${Number(item.quantity)}x ${item.productName}`;
      })
      .join(", ");
  }, [cart]);

  const itemSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);

      if (
        !Number.isFinite(price) ||
        !Number.isFinite(quantity)
      ) {
        return sum;
      }

      return sum + price * quantity;
    }, 0);
  }, [cart]);

  /*
   * This is only a checkout estimate.
   *
   * The backend TaxEngineService remains the authoritative
   * source for the final tax and total amount.
   */
  const estimatedTax = useMemo(() => {
    const taxableAmount =
      itemSubtotal + deliveryFee + serviceFee;

    return (
      taxableAmount * countrySettings.estimatedTaxRate
    );
  }, [
    countrySettings.estimatedTaxRate,
    deliveryFee,
    itemSubtotal,
    serviceFee,
  ]);

  const discount = 0;

  const estimatedTotal =
    itemSubtotal +
    deliveryFee +
    serviceFee +
    estimatedTax -
    discount;

  function handleCountryChange(country: CountryCode) {
    const settings = COUNTRY_SETTINGS[country];

    setSelectedCountry(country);
    setSelectedCurrency(settings.currency);

    setError("");

    if (country === "PH") {
        if (gateway === "paypal") {
            setGateway("paymongo_gcash");
        }
    }

    if (country === "US") {
        if (gateway === "paymongo_gcash") {
            setGateway("paypal");
        }
    }
}

  async function submit() {
    setError("");

    const normalizedCustomerName = customerName.trim();
    const normalizedPickupAddress = pickupAddress.trim();
    const normalizedDeliveryAddress =
      deliveryAddress.trim();

    if (!normalizedCustomerName) {
      setError("Customer name is required.");
      return;
    }

    if (!normalizedPickupAddress) {
      setError("Pickup address is required.");
      return;
    }

    if (!normalizedDeliveryAddress) {
      setError("Delivery address is required.");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (itemSubtotal <= 0) {
      setError("Cart total must be greater than zero.");
      return;
    }

    if (
      selectedCountry === "PH" &&
      selectedCurrency !== "PHP"
    ) {
      setError(
        "Philippine orders must use PHP currency."
      );
      return;
    }

    if (
      selectedCountry === "MX" &&
      selectedCurrency !== "MXN"
    ) {
      setError("Mexico orders must use MXN currency.");
      return;
    }

    if (
      selectedCountry === "US" &&
      selectedCurrency !== "USD"
    ) {
      setError(
        "United States orders must use USD currency."
      );
      return;
    }

    if (
    gateway === "paymongo_gcash" &&
    selectedCountry !== "PH"
) {
    setError(
        "PayMongo is only available in the Philippines."
    );

    return;
}

   if (
    gateway === "paypal" &&
    selectedCountry === "PH"
) {
    setError(
        "Use PayMongo instead of PayPal for Philippine orders."
    );

    return;
}

    try {
      setLoading(true);

      const response =
        (await createOrder({
          customerName: normalizedCustomerName,
          pickupAddress: normalizedPickupAddress,
          deliveryAddress: normalizedDeliveryAddress,
          itemDescription,
          zone,
          countryCode: selectedCountry,
          currency: selectedCurrency,
          paymentMethod: gateway,
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: Number(item.quantity),
          })),
        })) as CreateOrderResponse;

      const orderId =
        response?.order?.id ?? response?.id;

      if (!orderId) {
        throw new Error(
          "Order was created but no order ID was returned."
        );
      }
if (gateway === "cash") {
    clearCart();

    setCart([]);

    router.push(
        `/customer/orders/${orderId}`
    );

    return;
}

const payment = await createPayment({
    orderId,
    gateway
});

if (!payment.success) {
    throw new Error(
        payment.error ??
        "Unable to create payment."
    );
}

if (!payment.checkoutUrl) {
    throw new Error(
        "Payment gateway did not return a checkout URL."
    );
}

window.location.href =
    payment.checkoutUrl;

clearCart();

setCart([]);

router.push(`/customer/orders/${orderId}`);
    } catch (submitError: unknown) {
      console.error(
        "Create order failed:",
        submitError
      );

      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  const submitButtonText = (() => {

    if (loading) {

        return "Creating Order...";

    }

    switch (gateway) {

        case "paypal":

            return "Continue to PayPal";

        case "paymongo_gcash":

            return "Continue to PayMongo";

        case "maya":

            return "Continue to Maya";

        case "xendit":

            return "Continue to Xendit";

        case "hitpay":

            return "Continue to HitPay";

            case "stripe":
    return "Continue to Stripe";

        default:

            return "Create Cash Order";

    }

})();
  if (!cartLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] p-4 text-white">
        <p className="text-sm text-slate-400">
          Loading checkout...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] p-4 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-black">
            Checkout
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Review your information before creating the
            order.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <div className="space-y-4">
          <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <h2 className="font-bold text-slate-200">
              Customer Information
            </h2>

            <div>
              <label
                htmlFor="customerName"
                className="mb-1 block text-sm font-medium text-slate-300"
              >
                Customer name
              </label>

              <input
                id="customerName"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={customerName}
                disabled={loading}
                onChange={(event) =>
                  setCustomerName(event.target.value)
                }
                className="w-full rounded-xl border border-slate-600 bg-white p-3 text-black outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="pickupAddress"
                className="mb-1 block text-sm font-medium text-slate-300"
              >
                Pickup address
              </label>

              <input
                id="pickupAddress"
                type="text"
                autoComplete="street-address"
                placeholder="Enter pickup address"
                value={pickupAddress}
                disabled={loading}
                onChange={(event) =>
                  setPickupAddress(event.target.value)
                }
                className="w-full rounded-xl border border-slate-600 bg-white p-3 text-black outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="deliveryAddress"
                className="mb-1 block text-sm font-medium text-slate-300"
              >
                Delivery address
              </label>

              <input
                id="deliveryAddress"
                type="text"
                autoComplete="street-address"
                placeholder="Enter delivery address"
                value={deliveryAddress}
                disabled={loading}
                onChange={(event) =>
                  setDeliveryAddress(event.target.value)
                }
                className="w-full rounded-xl border border-slate-600 bg-white p-3 text-black outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-200"
              />
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <h2 className="font-bold text-slate-200">
              Country and Payment
            </h2>

            <div>
              <label
                htmlFor="country"
                className="mb-1 block text-sm font-medium text-slate-300"
              >
                Country
              </label>

              <select
                id="country"
                value={selectedCountry}
                disabled={loading}
                onChange={(event) =>
                  handleCountryChange(
                    event.target.value as CountryCode
                  )
                }
                className="w-full rounded-xl border border-slate-600 bg-white p-3 text-black outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-200"
              >
                <option value="PH">
                  Philippines
                </option>

                <option value="MX">
                  Mexico
                </option>

                <option value="US">
                  United States
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="currency"
                className="mb-1 block text-sm font-medium text-slate-300"
              >
                Currency
              </label>

              <select
                id="currency"
                value={selectedCurrency}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-600 bg-slate-200 p-3 text-black"
              >
                <option value="PHP">
                  PHP - Philippine Peso
                </option>

                <option value="MXN">
                  MXN - Mexican Peso
                </option>

                <option value="USD">
                  USD - US Dollar
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="paymentMethod"
                className="mb-1 block text-sm font-medium text-slate-300"
              >
                Payment method
              </label>

              <div className="space-y-3">

    <label className="block text-sm font-medium text-slate-300">

        Payment Gateway

    </label>

    <PaymentSelector
    value={gateway}
    onChange={(value) => setGateway(value as PaymentGateway)}
/>

</div>
            </div>

            {gateway ===
              "paymongo_gcash" && (
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-200">

    You will be redirected to PayMongo Checkout.

</div>
            )}

            {gateway === "paypal" && (
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-200">
                You will be redirected to PayPal after
                the order is created.
              </div>
            )}
{gateway === "maya" && (

<div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-200">

    You will be redirected to Maya Checkout.

</div>

)}
{gateway === "xendit" && (

<div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-200">

    You will be redirected to Xendit Checkout.

</div>

)}
{gateway === "hitpay" && (

<div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-200">

    You will be redirected to HitPay Checkout.

</div>

)}

{gateway === "stripe" && (
    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs text-indigo-200">
        You will be redirected to Stripe Checkout
        to securely complete your payment.
    </div>
)}
            {gateway === "cash" && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                Your payment will remain pending until
                the cash payment is confirmed.
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm">
            <p className="mb-3 font-bold text-slate-300">
              Order Items
            </p>

            {cart.length === 0 ? (
              <p className="text-slate-400">
                Your cart is empty.
              </p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => {
                  const lineTotal =
                    Number(item.price) *
                    Number(item.quantity);

                  return (
                    <div
                      key={item.productId}
                      className="flex justify-between gap-3 text-slate-300"
                    >
                      <span className="min-w-0 flex-1">
                        {item.quantity}x{" "}
                        {item.productName}
                      </span>

                      <span className="shrink-0 font-medium">
                        {formatCurrency(
                          lineTotal,
                          selectedCurrency
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-2 rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-300">
                Item subtotal
              </span>

              <span>
                {formatCurrency(
                  itemSubtotal,
                  selectedCurrency
                )}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-300">
                Delivery fee
              </span>

              <span>
                {formatCurrency(
                  deliveryFee,
                  selectedCurrency
                )}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-300">
                Service fee
              </span>

              <span>
                {formatCurrency(
                  serviceFee,
                  selectedCurrency
                )}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-300">
                Estimated tax
              </span>

              <span>
                {formatCurrency(
                  estimatedTax,
                  selectedCurrency
                )}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between gap-3 text-emerald-300">
                <span>Discount</span>

                <span>
                  -
                  {formatCurrency(
                    discount,
                    selectedCurrency
                  )}
                </span>
              </div>
            )}

            <div className="mt-3 flex justify-between gap-3 border-t border-slate-700 pt-3 text-base font-black">
              <span>Estimated total</span>

              <span>
                {formatCurrency(
                  estimatedTotal,
                  selectedCurrency
                )}
              </span>
            </div>

            <p className="pt-2 text-xs leading-5 text-slate-500">
              The final amount is calculated by the
              server and may change based on applicable
              tax rules.
            </p>
          </section>

          <button
            type="button"
            onClick={submit}
            disabled={
              loading ||
              cart.length === 0 ||
              itemSubtotal <= 0
            }
            className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
          >
            {submitButtonText}
          </button>
        </div>
      </div>
    </main>
  );
}