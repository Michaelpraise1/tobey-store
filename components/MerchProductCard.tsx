"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { MerchProduct } from "@/lib/queries/merch";
import { cn } from "@/lib/utils";

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  tshirt: "T-Shirt",
  hoodie: "Hoodie",
  beanie: "Beanie",
  hat: "Hat",
  mug: "Mug",
  sticker: "Sticker",
  joggers: "Joggers",
  other: "Item",
};

interface MerchProductCardProps {
  product: MerchProduct;
}

const MerchProductCard = ({ product }: MerchProductCardProps) => {
  const [activeDesignIdx, setActiveDesignIdx] = useState(0);
  const designs = product.designs ?? [];
  const activeDesign = designs[activeDesignIdx];

  const imageSource =
    activeDesign?.previewImage?.asset ? urlFor(activeDesign.previewImage).url() : null;

  const typeLabel = PRODUCT_TYPE_LABELS[product.productType] ?? "Item";
  const sizesExist = product.availableSizes && product.availableSizes.length > 0;

  return (
    <div className="group flex flex-col h-full bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <Link
          href={`/merch/${product.slug.current}`}
          className="absolute inset-0 z-10"
          aria-label={`View ${product.title}`}
        />

        {imageSource ? (
          <Image
            src={imageSource}
            alt={activeDesign?.previewImage?.alt ?? product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ShoppingBag className="w-12 h-12 text-gray-200" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-20">
          <span className="bg-shop-dark-red text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md">
            {typeLabel}
          </span>
          {product.isFeatured && (
            <span className="flex items-center gap-1 bg-shop-orange text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md">
              <Star size={9} fill="white" />
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Design thumbs — shown only when there are multiple designs */}
      {designs.length > 1 && (
        <div className="flex gap-1.5 px-3 pt-3">
          {designs.map((design, i) => {
            const thumb = design.previewImage?.asset
              ? urlFor(design.previewImage).width(60).height(60).url()
              : null;
            return (
              <button
                key={design._key}
                onClick={() => setActiveDesignIdx(i)}
                title={design.name}
                className={cn(
                  "w-8 h-8 rounded-md border-2 overflow-hidden transition-all duration-200 focus:outline-none",
                  activeDesignIdx === i
                    ? "border-shop-dark-red scale-105 shadow-md"
                    : "border-gray-200 hover:border-gray-400"
                )}
              >
                {thumb ? (
                  <Image
                    src={thumb}
                    alt={design.name}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 pt-2">
        <Link href={`/merch/${product.slug.current}`}>
          <h3 className="font-semibold text-base line-clamp-1 text-gray-900 hover:text-shop-dark-red transition-colors">
            {product.title}
          </h3>
        </Link>

        {activeDesign && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
            Design: {activeDesign.name}
          </p>
        )}

        {/* Size pills */}
        {sizesExist && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.availableSizes!.slice(0, 5).map((sz) => (
              <span
                key={sz}
                className="text-[10px] uppercase border border-gray-200 rounded px-1.5 py-0.5 text-gray-500 font-medium"
              >
                {sz}
              </span>
            ))}
            {product.availableSizes!.length > 5 && (
              <span className="text-[10px] text-gray-400">+more</span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-bold text-lg text-gray-900">
            ${product.basePrice.toFixed(2)}
          </span>
          <Link
            href={`/merch/${product.slug.current}`}
            className="flex items-center gap-1.5 bg-shop-dark-red hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors duration-200"
          >
            <ShoppingBag size={12} />
            Customize
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MerchProductCard;
