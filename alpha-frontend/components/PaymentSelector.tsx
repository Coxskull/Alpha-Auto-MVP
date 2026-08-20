type Props = {
    value: string;
    onChange: (gateway: string) => void;
};

export default function PaymentSelector({
    value,
    onChange
}: Props) {

    return (
        <div className="space-y-3">

            <label className="flex items-center gap-3">
                <input
                    type="radio"
                    value="stripe"
                    checked={value === "stripe"}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                />

                <span>
                    Stripe
                </span>
            </label>

            <label className="flex items-center gap-3">
                <input
                    type="radio"
                    value="paymongo_gcash"
                    checked={
                        value === "paymongo_gcash"
                    }
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                />

                <span>
                    PayMongo / GCash
                </span>
            </label>

            <label className="flex items-center gap-3">
                <input
                    type="radio"
                    value="xendit"
                    checked={value === "xendit"}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                />

                <span>
                    Xendit
                </span>
            </label>

            <label className="flex items-center gap-3">
                <input
                    type="radio"
                    value="maya"
                    checked={value === "maya"}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                />

                <span>
                    Maya Business
                </span>
            </label>

            <label className="flex items-center gap-3">
                <input
                    type="radio"
                    value="hitpay"
                    checked={value === "hitpay"}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                />

                <span>
                    HitPay
                </span>
            </label>

            <label className="flex items-center gap-3">
                <input
                    type="radio"
                    value="paypal"
                    checked={value === "paypal"}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                />

                <span>
                    PayPal
                </span>
            </label>
<label className="flex items-center gap-3">
    <input
        type="radio"
        value="cash"
        checked={value === "cash"}
        onChange={(e) =>
            onChange(e.target.value)
        }
    />

    <span>
        Cash on Delivery
    </span>
</label>
        </div>
    );
}