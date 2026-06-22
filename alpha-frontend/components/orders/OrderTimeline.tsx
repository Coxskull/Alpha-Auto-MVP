type TimelineStep = {
  label: string;
  completed: boolean;
  active?: boolean;
  time?: string;
};

type Props = {
  steps: TimelineStep[];
};

export default function OrderTimeline({
  steps,
}: Props) {
  return (
    <div className="w-full">
      <div className="
  flex
  items-center
  gap-2
  overflow-x-auto
  pb-2
">
        {steps.map((step, index) => {
          const isLast =
            index === steps.length - 1;

          return (
            <div
              key={step.label}
              className="flex
  items-center
  min-w-[120px]"
            >
              {/* Node */}
              <div className="flex flex-col items-center min-w-[70px]">
                <div
                  className={`h-5 w-5 rounded-full border-2 transition-all ${
                    step.completed
                      ? "bg-green-500 border-green-500"
                      : step.active
                      ? "border-green-400 bg-green-500/20"
                      : "border-gray-600 bg-[#111827]"
                  }`}
                />

                <p
                  className={`text-xs mt-3 text-center ${
                    step.completed || step.active
                      ? "text-white"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>

                {step.time && (
                  <span className="text-[10px] text-gray-500 mt-1">
                    {step.time}
                  </span>
                )}
              </div>

              {/* Line */}
              {!isLast && (
                <div className="flex-1 h-[2px] mx-2 bg-gray-700 relative">
                  <div
                    className={`absolute top-0 left-0 h-full ${
                      step.completed
                        ? "bg-green-500 w-full"
                        : "bg-transparent w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}