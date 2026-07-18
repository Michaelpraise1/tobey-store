"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getMerchProducts, getMerchProductTypes, MerchProduct } from "@/lib/queries/merch";
import MerchProductCard from "@/components/MerchProductCard";
import { Loader2, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  tshirt: "T-Shirts",
  hoodie: "Hoodies",
  beanie: "Beanies",
  hat: "Hats",
  mug: "Mugs",
  sticker: "Stickers",
  joggers: "Joggers",
  other: "Other",
};

const MerchGrid = () => {
  const [products, setProducts] = useState<MerchProduct[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [activeType, setActiveType] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Load available types once
  useEffect(() => {
    getMerchProductTypes().then((t) => setTypes(t ?? []));
  }, []);

  // Load products whenever filter changes
  const fetchProducts = useCallback(async (type: string) => {
    setLoading(true);
    try {
      const data = await getMerchProducts(type === "all" ? undefined : type);
      setProducts(data ?? []);
    } catch (err) {
      console.error("Error fetching merch products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(activeType);
  }, [activeType, fetchProducts]);

  const tabs = ["all", ...types];

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            id={`merch-filter-${tab}`}
            onClick={() => setActiveType(tab)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider border transition-all duration-200",
              activeType === tab
                ? "bg-shop-dark-red text-white border-shop-dark-red shadow-md"
                : "bg-white text-gray-500 border-gray-200 hover:border-shop-dark-red hover:text-shop-dark-red"
            )}
          >
            {tab === "all" ? "All Items" : (TYPE_LABELS[tab] ?? tab)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-72 gap-3 bg-gray-50 rounded-2xl">
          <Loader2 className="w-6 h-6 animate-spin text-shop-dark-red" />
          <span className="text-sm text-gray-400 font-medium">Loading merch...</span>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                <MerchProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-72 gap-4 bg-gray-50 rounded-2xl text-center px-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
          <div>
            <p className="font-semibold text-gray-700 text-lg">No merch here yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Check back soon — new drops are coming.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchGrid;
