"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // For redirection

const UploadOutfitPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [name, setName] = useState(""); // Outfit name
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // Success state
  const [error, setError] = useState("");
  const router = useRouter(); // Next.js router for redirection

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProcessedImage(null);
      setName("");
    }
  };

  const handleProcessImage = async () => {
    if (!file) {
      setError("Please select an image.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("imageFile", file);

      const response = await fetch("/api/uploadImage", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setProcessedImage(data.processedImageUrl);
      } else {
        setError(data.message || "Failed to process the image.");
      }
    } catch (err) {
      setError("An error occurred while processing the image.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOutfit = async () => {
    if (!processedImage || !name) {
      setError("Please provide an outfit name and process the image first.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/saveOutfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: processedImage,
          name,
        }),
      });

      if (response.ok) {
        setSuccess(true); // Show success checkmark
        setTimeout(() => {
          router.push("/dashboard"); // Redirect to dashboard after 1 second
        }, 1000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to save the outfit.");
      }
    } catch (err) {
      setError("An error occurred while saving the outfit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
      {success ? ( // Display success checkmark
        <div className="absolute inset-0 flex items-center justify-center bg-green-100">
          <div className="text-green-600 text-6xl font-bold">&#10003;</div>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Upload Today's Outfit</h1>

          {/* File Input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-4"
          />

          {/* Process Image Button */}
          <button
            onClick={handleProcessImage}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading || !file}
          >
            {loading ? "Processing..." : "Process Image"}
          </button>

          {/* Display Processed Image and Outfit Name Input */}
          {processedImage && (
            <div className="mt-4">
              <img
                src={processedImage}
                alt="Processed Outfit"
                className="border rounded mb-4 w-64 h-64 object-contain"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Outfit Name"
                className="mb-4 p-2 border rounded w-full"
              />
              <button
                onClick={handleSaveOutfit}
                className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
                disabled={loading || !name}
              >
                {loading ? "Saving..." : "Save Outfit"}
              </button>
            </div>
          )}

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </>
      )}
    </div>
  );
};

export default UploadOutfitPage;
