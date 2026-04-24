"use client";

import React, { useState } from "react";
import { Product } from "@/sanity.types";

export default function ProductOptionSelect({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes && product.sizes.length > 0 ? String(product.sizes[0]) : null
  );
  
  const [selectedTaste, setSelectedTaste] = useState<string | null>(
    product.taste && product.taste.length > 0 ? String(product.taste[0]) : null
  );

  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasTaste = product.taste && product.taste.length > 0;

  if (!hasSizes && !hasTaste) return null;

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
    </div>
  );
}
