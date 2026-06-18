"use client";

export default function AccountPage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">
        My Account
      </h1>

      <div className="space-y-4 mt-4">
        <div className="border p-4 rounded">
          Profile
        </div>

        <div className="border p-4 rounded">
          Addresses
        </div>

        <div className="border p-4 rounded">
          Settings
        </div>
      </div>
    </main>
  );
}