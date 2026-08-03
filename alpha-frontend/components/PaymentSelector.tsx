type Props = {
    value: string;
    onChange: (gateway: string) => void;
};

export default function PaymentSelector({
    value,
    onChange
}: Props) {

    return (

        <div className="space-y-2">

            <label>

                <input
                    type="radio"
                    value="paymongo"
                    checked={value === "paymongo"}
                    onChange={(e) => onChange(e.target.value)}
                />

                PayMongo

            </label>

            <label>

                <input
                    type="radio"
                    value="xendit"
                    checked={value === "xendit"}
                    onChange={(e) => onChange(e.target.value)}
                />

                Xendit

            </label>

            <label>

                <input
                    type="radio"
                    value="maya"
                    checked={value === "maya"}
                    onChange={(e) => onChange(e.target.value)}
                />

                Maya Business

            </label>

            <label>

                <input
                    type="radio"
                    value="hitpay"
                    checked={value === "hitpay"}
                    onChange={(e) => onChange(e.target.value)}
                />

                HitPay

            </label>

            <label>

                <input
                    type="radio"
                    value="paypal"
                    checked={value === "paypal"}
                    onChange={(e) => onChange(e.target.value)}
                />

                PayPal

            </label>

        </div>

    );

}