"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/sanity.types";
import { useCartStore } from "@/store/store";
import { useUser, useClerk } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { ShoppingCart, Cpu, Heart } from "lucide-react";
import AiFitSystem from "@/components/AiFitSystem";

export default function ProductOptionSelect({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes && product.sizes.length > 0 ? String(product.sizes[0]) : null
  );
  
  const [selectedTaste, setSelectedTaste] = useState<string | null>(
    product.taste && product.taste.length > 0 ? String(product.taste[0]) : null
  );

  const [aiConfirmedSize, setAiConfirmedSize] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("mortal-fang-ai-size");
    if (saved) {
      setAiConfirmedSize(saved);
      setSelectedSize(saved);
    }
  }, []);

  const addItem = useCartStore((state) => state.addItem);
  const toggleFavorite = useCartStore((state) => state.toggleFavorite);
  const isFavorite = useCartStore((state) => state.isFavorite);
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasTaste = product.taste && product.taste.length > 0;
  const favorited = isFavorite(product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isSignedIn) {
      toast.error("Please sign in to add items to your cart", {
        icon: "🔐",
        style: {
          borderRadius: "8px",
          background: "#151515",
          color: "#fff",
          border: "1px solid #7f1d1d",
        },
      });
      openSignIn();
      return;
    }

    const selectedOptionsText = selectedSize ? ` (Size: ${selectedSize})` : "";
    addItem(product);
    toast.success(`${product?.title?.substring(0, 12)}...${selectedOptionsText} added to cart`);
  };

  const handleAiAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isSignedIn) {
      toast.error("Please sign in to add items to your cart", {
        icon: "🔐",
        style: {
          borderRadius: "8px",
          background: "#151515",
          color: "#fff",
          border: "1px solid #7f1d1d",
        },
      });
      openSignIn();
      return;
    }

    if (!aiConfirmedSize) {
      toast.error("Please confirm your AI clothing fit profile first!", {
        icon: "🤖",
        style: {
          borderRadius: "8px",
          background: "#151515",
          color: "#fff",
          border: "1px solid #7f1d1d",
        },
      });
      return;
    }

    addItem(product);
    toast.success(`${product?.title?.substring(0, 12)}... (AI Fit: ${aiConfirmedSize}) added to cart`, {
      icon: "🤖",
      style: {
        borderRadius: "8px",
        background: "#151515",
        color: "#fff",
        border: "1px solid #047857",
      },
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error("Please sign in to save favorites", {
        icon: "🔐",
        style: {
          borderRadius: "8px",
          background: "#151515",
          color: "#fff",
          border: "1px solid #7f1d1d",
        },
      });
      openSignIn();
      return;
    }
    toggleFavorite(product);
    if (favorited) {
      toast("Removed from favorites", { icon: "💔" });
    } else {
      toast.success("Added to favorites!", { icon: "❤️" });
    }
  };

  return (
    <div className="flex flex-col gap-6 mb-6">
      {hasSizes && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Size</h3>
          <div className="flex flex-wrap gap-3">
            {product.sizes?.map((size: string | number) => (
              <button
                key={String(size)}
                onClick={() => setSelectedSize(String(size))}
                className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${
                  selectedSize === String(size)
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-900"
                }`}
              >
                {String(size)}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasTaste && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Taste</h3>
          <div className="flex flex-wrap gap-3">
             {product.taste?.map((t: string | number) => (
              <button
                key={String(t)}
                onClick={() => setSelectedTaste(String(t))}
                className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${
                  selectedTaste === String(t)
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-900"
                }`}
              >
                {String(t)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Sizing Section */}
      {hasSizes && (
        <AiFitSystem
          availableSizes={product.sizes as string[]}
          onConfirmFit={(recommendedSize) => {
            setSelectedSize(recommendedSize);
            setAiConfirmedSize(recommendedSize);
          }}
        />
      )}

      {/* Standard Actions Row */}
      <div className="mt-4 flex gap-4">
        <button
          onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-shop-dark-red text-white py-3 px-4 rounded-md transition-all duration-300 font-bold text-sm cursor-pointer"
        >
          <ShoppingCart size={16} />
          <span>{isSignedIn ? "Add to Cart" : "Sign in to Buy"}</span>
        </button>

        <button
          onClick={handleToggleFavorite}
          title={favorited ? "Remove from favorites" : "Add to favorites"}
          className={`p-3 border rounded-md transition-all duration-300 cursor-pointer ${
            favorited
              ? "bg-shop-dark-red text-white border-shop-dark-red"
              : "border-gray-300 bg-white text-gray-500 hover:bg-gray-55"
          }`}
        >
          <Heart size={18} className={favorited ? "fill-white text-white" : ""} />
        </button>
      </div>

      {/* AI Shape Fit Action Button */}
      {hasSizes && (
        <button
          onClick={handleAiAddToCart}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white py-3 px-4 rounded-md transition-all duration-300 font-black uppercase tracking-wider text-xs shadow-md shadow-red-500/10 hover:shadow-red-500/20 cursor-pointer"
        >
          <Cpu size={14} className="animate-pulse" />
          <span>AI Shape Fit - Add to Cart</span>
        </button>
      )}
    </div>
  );
}
