"use client";

import {
  Bell,
  Search,
  Globe,
  Menu,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import api from "@/services/api";
type Alert = {
  id: string;
  alertType: string;
  message: string;
  createdAt: string;
};
type Props = {
  onMenuClick?: () => void;
};

export default function Topbar({
  onMenuClick,
}: Props) {
const [alerts, setAlerts] =
  useState<Alert[]>([]);

  const [showAlerts, setShowAlerts] =
    useState(false);

  useEffect(() => {
    const loadAlerts = async () => {
  try {
    const response =
      await api.get<Alert[]>("/api/Alerts");

    setAlerts(response.data);
  } catch (error) {
    console.warn(
      "Alerts endpoint not available yet"
    );

    setAlerts([]);
  }
};

    loadAlerts();

    const interval =
      setInterval(loadAlerts, 30000);

    return () =>
      clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 h-[80px] bg-[#111827]/95 backdrop-blur-xl border-b border-white/5">
      <div
        className="
          h-full
          px-4
          md:px-6
          lg:px-8
          flex
          items-center
          justify-between
        "
      >
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="
              lg:hidden
              h-10
              w-10
              rounded-xl
              bg-[#1F2937]
              border
              border-white/5
              flex
              items-center
              justify-center
              text-white
            "
          >
            <Menu size={20} />
          </button>

          <div>
            <h2
              className="
                text-lg
                sm:text-xl
                lg:text-2xl
                font-bold
                text-white
                truncate
              "
            >
              Alpha Mission Control
            </h2>

            <p
              className="
                hidden
                md:block
                text-sm
                text-gray-400
                mt-1
              "
            >
              Real-time logistics dispatch and
              operations
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="hidden lg:flex items-center w-[420px]">
          <div className="relative w-full">
            <Search
              size={18}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-gray-500
              "
            />

            <input
              type="text"
              placeholder="Search orders, drivers, suppliers..."
              className="
                w-full
                bg-[#1F2937]
                border
                border-white/5
                rounded-2xl
                pl-12
                pr-4
                py-3
                text-sm
                text-white
                placeholder:text-gray-500
                outline-none
                focus:border-green-500
                transition-all
              "
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Environment */}
          <div className="hidden md:flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl">
            <Globe
              size={16}
              className="text-green-400"
            />

            <span className="text-sm font-medium text-green-400">
              LIVE
            </span>
          </div>

          {/* Alerts */}
          <div className="relative">
            <button
              onClick={() =>
                setShowAlerts(
                  !showAlerts
                )
              }
              className="
                relative
                h-12
                w-12
                rounded-2xl
                bg-[#1F2937]
                border
                border-white/5
                flex
                items-center
                justify-center
                text-gray-300
                hover:text-white
                transition-all
              "
            >
              <Bell size={18} />

              {alerts.length > 0 && (
                <span
                  className="
                    absolute
                    -top-1
                    -right-1
                    min-w-[20px]
                    h-5
                    px-1
                    rounded-full
                    bg-red-500
                    text-white
                    text-[10px]
                    flex
                    items-center
                    justify-center
                  "
                >
                  {alerts.length}
                </span>
              )}
            </button>

            {showAlerts && (
              <div
                className="
                  absolute
                  right-0
                  mt-3
                  w-96
                  max-h-[450px]
                  overflow-y-auto
                  bg-[#111827]
                  border
                  border-white/10
                  rounded-2xl
                  shadow-2xl
                  z-50
                "
              >
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-white font-semibold">
                    Operational Alerts
                  </h3>
                </div>

                {alerts.length === 0 ? (
                  <div className="p-4 text-gray-400">
                    No active alerts
                  </div>
                ) : (
                  alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="
                          p-4
                          border-b
                          border-white/5
                          hover:bg-white/5
                        "
                      >
                        <p className="text-white text-sm">
                          {
                            alert.message
                          }
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(
                            alert.createdAt
                          ).toLocaleString()}
                        </p>
                      </div>
                    )
                  )
                )}
              </div>
            )}
          </div>

          {/* Profile */}
          <div
            className="
              flex
              items-center
              gap-2
              bg-[#1F2937]
              border
              border-white/5
              px-2
              md:px-3
              py-2
              rounded-2xl
            "
          >
            <div className="h-10 w-10 rounded-xl bg-green-500 flex items-center justify-center text-black font-bold">
              D
            </div>

            <div className="hidden md:block">
              <p className="text-sm font-semibold text-white">
                Dispatcher
              </p>

              <p className="text-xs text-gray-400">
                Alpha Operations
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}