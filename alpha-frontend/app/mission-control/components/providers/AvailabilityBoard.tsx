"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Bike,
  Store,
} from "lucide-react";

import api from "@/services/api";


interface Supplier {
  id: string;
  name: string;
  availabilityStatus: string;
}

interface Driver {
  id: string;
  fullName: string;
  availabilityStatus: string;
}

interface Props {
  type: "suppliers" | "drivers";
}

export default function AvailabilityBoard({
  type,
}: Props) {

  const [data, setData] = useState<
    Supplier[] | Driver[]
  >([]);

  useEffect(() => {

    let mounted = true;

    const fetchData = async () => {

      try {

        const response =
  type === "suppliers"
    ? await api.get("/api/Suppliers/available")
    : await api.get("/api/Drivers/available");

        if (mounted) {

          setData(response.data);

        }

      } catch (error) {

        console.error(error);

      }

    };

    fetchData();

    const interval =
      setInterval(fetchData, 15000);

    return () => {

      mounted = false;

      clearInterval(interval);

    };

  }, [type]);

  return (

    <div
      className="
        bg-white
        border
        border-gray-200
        rounded-3xl
        shadow-sm
        overflow-hidden
      "
    >

      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          px-6
          py-5
          border-b
          border-gray-200
        "
      >

        <div
          className="
            flex
            items-center
            gap-4
          "
        >

          <div
            className="
              w-12
              h-12
              rounded-2xl
              bg-gray-100
              flex
              items-center
              justify-center
            "
          >

            {type === "suppliers"
              ? (
                <Store className="text-orange-500" />
              )
              : (
                <Bike className="text-green-500" />
              )}

          </div>

          <div>

            <h2
              className="
                text-xl
                font-bold
                text-[#111827]
              "
            >
              {type === "suppliers"
                ? "Suppliers"
                : "Drivers"}
            </h2>

            <p
              className="
                text-sm
                text-gray-500
              "
            >
              {type === "suppliers"
                ? "Live supplier availability"
                : "Live fleet availability"}
            </p>

          </div>

        </div>

        <div
          className="
            text-sm
            text-gray-500
            font-medium
          "
        >
          {data.length} Online
        </div>

      </div>

      {/* BODY */}

      <div className="divide-y divide-gray-100">

        {data.map((item) => (

          <div
            key={item.id}
            className="
              flex
              items-center
              justify-between
              px-6
              py-4
              hover:bg-gray-50
            "
          >

            <p
              className="
                font-semibold
                text-[#111827]
              "
            >
              {"name" in item
                ? item.name
                : item.fullName}
            </p>

           <div
  className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
    item.availabilityStatus === "available"
      ? "bg-green-500/20 text-green-400"
      : item.availabilityStatus === "busy"
      ? "bg-orange-500/20 text-orange-400"
      : "bg-red-500/20 text-red-400"
  }`}
>
  {item.availabilityStatus}
</div>

          </div>

        ))}

      </div>

    </div>
  );
}