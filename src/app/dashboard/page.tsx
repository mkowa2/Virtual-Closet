"use client";
import { useEffect, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const categoryOrder = ["Tops", "Bottoms", "Dresses", "Shoes", "Accessories"];
const ITEMS_PER_PAGE = 3; 

const DashboardPage = () => {
  const [items, setItems] = useState([]);
  const [groupedItems, setGroupedItems] = useState({});
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [outfitForToday, setOutfitForToday] = useState(false);
  const [loadingOutfit, setLoadingOutfit] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/getClothingItems");
        const data = await response.json();

        if (response.ok) {
          const grouped = data.items.reduce((acc, item) => {
            const category = item.mainCategory;
            if (!acc[category]) acc[category] = [];
            acc[category].push({
              ...item,
              name: `${item.color} ${item.brand} ${item.subCategory}`, // Concatenate name
            });
            return acc;
          }, {});

          const initialPagination = Object.keys(grouped).reduce((acc, category) => {
            acc[category] = 0; 
            return acc;
          }, {});

          setGroupedItems(grouped);
          setPagination(initialPagination);
        } else {
          setError(data.message || "Failed to fetch clothing items.");
        }
      } catch (err) {
        setError("An error occurred while fetching items.");
      } finally {
        setLoading(false);
      }
    };

    const fetchTodaysOutfit = async () => {
        try {
          const today = new Date().toISOString().split("T")[0]; // Today's date in YYYY-MM-DD format
          const response = await fetch(`/api/getOutfitForDate?date=${today}`);
          const data = await response.json();
      
          if (response.ok && data.outfit) {
            setOutfitForToday(true);
          } else {
            setOutfitForToday(false);
          }
        } catch (err) {
          console.error("Error fetching today's outfit:", err);
          setOutfitForToday(false);
        } finally {
          setLoadingOutfit(false);
        }
      };
      

    fetchItems();
    fetchTodaysOutfit();
  }, []);

  const handleNextPage = (category) => {
    setPagination((prev) => ({
      ...prev,
      [category]: prev[category] + 1,
    }));
  };

  const handlePreviousPage = (category) => {
    setPagination((prev) => ({
      ...prev,
      [category]: Math.max(prev[category] - 1, 0),
    }));
  };

  if (loading || loadingOutfit) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen">{error}</div>;
  }

  if (Object.keys(groupedItems).length === 0) {
    return <div className="flex justify-center items-center min-h-screen">No items found.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Wardrobe</h1>
      {/* Today's Outfit Section */}
      {outfitForToday ? (
        <div className="flex items-center text-green-600 mb-6">
    <span className="text-lg font-semibold">Today's Outfit</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-6 h-6 ml-2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  </div>
) : (
  <Link href="/upload-outfit" className="text-blue-500 hover:underline mb-6 block">
    Upload Today's Outfit
  </Link>

      )}

      {/* Render Categories */}
      {categoryOrder.map((category) => {
        const items = groupedItems[category];
        if (!items || items.length === 0) return null; // Skip empty categories

        const currentPage = pagination[category] || 0;
        const startIndex = currentPage * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedItems = items.slice(startIndex, endIndex);

        return (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-bold mb-4">{category}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedItems.map((item) => (
                <div
                  key={item.id}
                  className="border p-4 rounded shadow-sm hover:shadow-lg transition"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-40 object-contain rounded mb-2 bg-gray-100"
                  />
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => handlePreviousPage(category)}
                className="disabled:opacity-50"
                disabled={currentPage === 0}
              >
                <ArrowLeftIcon className="w-6 h-6 text-gray-500 hover:text-gray-800" />
              </button>
              <button
                onClick={() => handleNextPage(category)}
                className="disabled:opacity-50"
                disabled={endIndex >= items.length}
              >
                <ArrowRightIcon className="w-6 h-6 text-gray-500 hover:text-gray-800" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardPage;
