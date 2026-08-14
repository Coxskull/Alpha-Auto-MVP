"use client";

export default function LoadingState() {
  return (
    <div className="rounded-xl border bg-white p-10 text-center shadow-sm">

      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

      <p className="mt-4 text-sm text-gray-500">
        Loading commission policy...
      </p>

    </div>
  );
}