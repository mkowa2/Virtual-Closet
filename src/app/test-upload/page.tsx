"use client";

import { useState } from "react";

const mainCategories = {
  Tops: [
    "Shirts",
    "T-Shirts",
    "Graphic Tees",
    "Sweatshirts/Hoodies",
    "Sweaters",
    "Turtlenecks",
    "Polos",
    "Crop Tops",
    "Blouses",
    "Bodysuits",
    "Tank Tops",
  ],
  Bottoms: [
    "Jeans",
    "Pants",
    "Sweatpants",
    "Leggings",
    "Shorts",
    "Skirts",
    "Thick Pants",
  ],
  "Jackets/Coats": [
    "Coats",
    "Jackets & Bombers",
    "Vests",
    "Blazers",
    "Raincoats",
    "Waterproof Jackets",
    "Windbreakers",
  ],
  Dresses: [
    "Mini Dresses",
    "Midi Dresses",
    "Maxi Dresses",
    "Rompers",
    "Jumpsuits",
    "Sweater Dresses",
  ],
  Shoes: [
    "Boots",
    "Gym Shoes",
    "Sneakers",
    "Heels",
    "Sandals",
    "Waterproof Shoes",
  ],
  Accessories: [
    "Hats",
    "Scarves",
    "Gloves",
    "Belts",
    "Watches & Jewelry",
    "Bags & Wallets",
    "Sunglasses",
    "Caps",
    "Umbrellas",
  ],
};


const TestUploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProcessedImageUrl(null); // Reset processed image when a new file is uploaded
    }
  };

  const handleProcessImage = async () => {
    if (!file) {
      setError("Please select an image file to process.");
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
        setProcessedImageUrl(data.processedImageUrl);
      } else {
        setError(data.message || "Failed to process the image.");
      }
    } catch (err) {
      setError("Failed to process the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    setMainCategory(selectedCategory);
    setSubcategories(mainCategories[selectedCategory] || []);
    setSubCategory(""); // Reset subcategory
  };

  const handleSave = async () => {
    if (!processedImageUrl || !brand || !color || !mainCategory || !subCategory) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/saveClothingItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: processedImageUrl,
          brand,
          color,
          mainCategory,
          subCategory,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Clothing item saved successfully!");
        // Reset form
        setFile(null);
        setProcessedImageUrl(null);
        setBrand("");
        setColor("");
        setMainCategory("");
        setSubCategory("");
      } else {
        setError(data.message || "Failed to save clothing item.");
      }
    } catch (err) {
      setError("Failed to save clothing item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Add Clothing Item</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4"
      />

      {file && !processedImageUrl && (
        <button
          onClick={handleProcessImage}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Processing..." : "Process Image"}
        </button>
      )}

      {processedImageUrl && (
        <>
          <img
            src={processedImageUrl}
            alt="Processed"
            className="border rounded mt-4 w-64 h-64 object-contain"
          />

          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Brand"
            className="mb-4 p-2 border rounded w-full"
          />

          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Color"
            className="mb-4 p-2 border rounded w-full"
          />

          <select
            value={mainCategory}
            onChange={handleMainCategoryChange}
            className="mb-4 p-2 border rounded w-full"
          >
            <option value="">Select Main Category</option>
            {Object.keys(mainCategories).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            disabled={!subcategories.length}
            className="mb-4 p-2 border rounded w-full"
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>

          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Clothing Item"}
          </button>
        </>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default TestUploadPage;
