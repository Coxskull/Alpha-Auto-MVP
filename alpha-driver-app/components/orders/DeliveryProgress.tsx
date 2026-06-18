import { OrderStatus } from "@/types/order";

type Props = {
  status: OrderStatus;
};

export default function DeliveryProgress({ status }: Props) {
  const stepMap: Record<OrderStatus, number> = {
    pending: 0,
    supplier_assigned: 0,
    supplier_accepted: 0,
    ready_for_pickup: 0,
    driver_assigned: 0,
    picked_up: 1,
    en_route: 2,
    delivered: 3,
    cancelled: 0,
  };

  const currentStep = stepMap[status] ?? 0;

  const steps = [
    "Assigned",
    "Picked Up",
    "En Route",
    "Delivered",
  ];

  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl p-5">
      <h3 className="text-white font-bold mb-5">
        Delivery Progress
      </h3>

      <div className="grid grid-cols-4 gap-3">
        {steps.map((step, index) => (
          <div key={step} className="text-center">
            <div
              className={`
                mx-auto h-10 w-10 rounded-full flex items-center justify-center font-bold
                ${
                  index <= currentStep
                    ? "bg-green-500 text-black"
                    : "bg-gray-700 text-gray-400"
                }
              `}
            >
              {index + 1}
            </div>

            <p
              className={`
                mt-2 text-xs
                ${
                  index <= currentStep
                    ? "text-green-400"
                    : "text-gray-500"
                }
              `}
            >
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}