"use client";

import { useState } from "react";
import { uploadDeliveryProof } from "@/services/orders";

type Props = {
  orderId: string;
  onUploaded: () => Promise<void>;
};

export default function ProofUpload({
  orderId,
  onUploaded,
}: Props) {
  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageFile(file);

    const localPreview =
      URL.createObjectURL(file);

    setPreviewUrl(localPreview);
  }

  async function handleSubmit() {
    if (!imageFile || !previewUrl) {
      alert("Please take or upload a photo first.");
      return;
    }

    try {
      setLoading(true);

      /*
        TEMPORARY MVP:
        Your current backend expects imageUrl as text.
        For now, we send the local preview URL.

        Later we will upload this file to Supabase Storage,
        Cloudinary, S3, or your API, then send the real image URL.
      */

      await uploadDeliveryProof(
        orderId,
        previewUrl
      );

      await onUploaded();

      setImageFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error(error);
      alert("Failed to submit proof.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl p-5">
      <h3 className="text-white font-bold mb-2">
        Delivery Proof
      </h3>

      <p className="text-gray-400 text-sm mb-4">
        Take a photo or upload an image to confirm delivery.
      </p>

      {previewUrl && (
        <div className="mb-4">
          <img
            src={previewUrl}
            alt="Delivery proof preview"
            className="w-full max-h-72 object-cover rounded-xl border border-white/10"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="cursor-pointer bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl text-center">
          Take Photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <label className="cursor-pointer bg-[#020617] border border-white/10 hover:bg-[#1f2937] text-white font-bold py-3 rounded-xl text-center">
          Upload Photo
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !imageFile}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-400 text-black font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? "Submitting..."
          : "Submit Proof"}
      </button>
    </div>
  );
}