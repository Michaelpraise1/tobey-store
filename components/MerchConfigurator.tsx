"use client";

import React, { useState } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { MerchProduct, MerchDesign, MerchColorOption } from "@/lib/queries/merch";
import { ShoppingBag, Check, ChevronLeft, ChevronRight, Truck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useClerk } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/store";

const SIZE_LABELS: Record<string, string> = {
  xs: "XS", s: "S", m: "M", l: "L", xl: "XL", "2xl": "2XL", "3xl": "3XL", one_size: "One Size",
};

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  tshirt: "T-Shirt", hoodie: "Hoodie", beanie: "Beanie", hat: "Hat",
  mug: "Mug", sticker: "Sticker", joggers: "Joggers", other: "Item",
};

interface Props {
  product: MerchProduct;
}

const MerchConfigurator = ({ product }: Props) => {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const designs: MerchDesign[] = product.designs ?? [];
  const colors: MerchColorOption[] = product.colorOptions ?? [];
  const sizes: string[] = product.availableSizes ?? [];
  const hasSizes = sizes.length > 0;
  const hasColors = colors.length > 0;
  const hasDesigns = designs.length > 0;

  const [selectedDesignIdx, setSelectedDesignIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<MerchColorOption | null>(
    colors[0] ?? null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    hasSizes ? sizes[0] : null
  );
  const [adding, setAdding] = useState(false);

  const activeDesign: MerchDesign | undefined = designs[selectedDesignIdx];
  const imageSource =
    activeDesign?.previewImage?.asset
      ? urlFor(activeDesign.previewImage).width(800).height(800).url()
      : null;

  const typeLabel = PRODUCT_TYPE_LABELS[product.productType] ?? "Item";

  const cycleDesign = (dir: 1 | -1) => {
    setSelectedDesignIdx((prev) =>
      (prev + dir + designs.length) % designs.length
    );
  };

  const { addMerchItem } = useCartStore();

  const handleAddToCart = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to add items to your cart", {
        icon: "🔐",
        style: { borderRadius: "8px", background: "#151515", color: "#fff", border: "1px solid #7f1d1d" },
      });
      openSignIn();
      return;
    }

    if (hasSizes && !selectedSize) {
      toast.error("Please select a size", {
        style: { borderRadius: "8px", background: "#151515", color: "#fff" },
      });
      return;
    }

    // Resolve the Printify variant ID from the active design's variant list.
    // The design's printifyVariantIds are indexed by color order (if color options exist),
    // or we just take the first available variant ID.
    let printifyVariantId: number | undefined;
    if (activeDesign?.printifyVariantIds && activeDesign.printifyVariantIds.length > 0) {
      if (hasColors && selectedColor) {
        // Try to find the color's index to pick the matching variant
        const colorIndex = colors.findIndex((c) => c._key === selectedColor._key);
        printifyVariantId =
          activeDesign.printifyVariantIds[colorIndex] ??
          activeDesign.printifyVariantIds[0];
      } else {
        printifyVariantId = activeDesign.printifyVariantIds[0];
      }
    }

    setAdding(true);

    addMerchItem(product, {
      selectedSize: selectedSize ?? undefined,
      selectedColor: selectedColor?.label ?? undefined,
      selectedDesign: activeDesign?.name ?? undefined,
      printifyVariantId,
    });

    toast.success(
      `${product.title}${selectedSize ? ` (${SIZE_LABELS[selectedSize] ?? selectedSize})` : ""} added!`,
      {
        icon: "🛒",
        style: { borderRadius: "8px", background: "#151515", color: "#fff", border: "1px solid #047857" },
      }
    );

    setAdding(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
      {/* ── Left: Image Viewer ── */}
      <div className="relative">
        <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 relative">
          {imageSource ? (
            <Image
              src={imageSource}
              alt={activeDesign?.previewImage?.alt ?? product.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-gray-200" />
            </div>
          )}

          {/* Design nav arrows (only if >1 design) */}
          {designs.length > 1 && (
            <>
              <button
                onClick={() => cycleDesign(-1)}
                aria-label="Previous design"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow border border-white flex items-center justify-center hover:bg-white transition-colors z-10"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => cycleDesign(1)}
                aria-label="Next design"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow border border-white flex items-center justify-center hover:bg-white transition-colors z-10"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Current color overlay label */}
          {selectedColor && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
              <span
                className="w-3 h-3 rounded-full border border-white/40"
                style={{ backgroundColor: selectedColor.hex ?? "#ccc" }}
              />
              {selectedColor.label}
            </div>
          )}
        </div>

        {/* Design thumbnail strip */}
        {designs.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {designs.map((design, i) => {
              const thumb = design.previewImage?.asset
                ? urlFor(design.previewImage).width(80).height(80).url()
                : null;
              return (
                <button
                  key={design._key}
                  onClick={() => setSelectedDesignIdx(i)}
                  title={design.name}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                    selectedDesignIdx === i
                      ? "border-shop-dark-red ring-2 ring-shop-dark-red/20"
                      : "border-gray-200 hover:border-gray-400"
                  )}
                >
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={design.name}
                      width={64}
                      height={64}
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
      </div>

      {/* ── Right: Configurator ── */}
      <div className="flex flex-col gap-7">
        {/* Title & type */}
        <div>
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-shop-dark-red mb-2">
            {typeLabel}
          </span>
          <h1 className="font-gaming text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            {product.title}
          </h1>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ${product.basePrice.toFixed(2)}
          </p>
        </div>

        {/* Design selector */}
        {hasDesigns && (
          <div>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
              Design
              {activeDesign && (
                <span className="ml-2 text-shop-dark-red font-semibold normal-case tracking-normal">
                  — {activeDesign.name}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {designs.map((design, i) => (
                <button
                  key={design._key}
                  id={`merch-design-${design._key}`}
                  onClick={() => setSelectedDesignIdx(i)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200",
                    selectedDesignIdx === i
                      ? "bg-shop-dark-red text-white border-shop-dark-red"
                      : "bg-white text-gray-600 border-gray-200 hover:border-shop-dark-red hover:text-shop-dark-red"
                  )}
                >
                  {design.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color selector */}
        {hasColors && (
          <div>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
              Color
              {selectedColor && (
                <span className="ml-2 text-shop-dark-red font-semibold normal-case tracking-normal">
                  — {selectedColor.label}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((color) => (
                <button
                  key={color._key}
                  id={`merch-color-${color._key}`}
                  onClick={() => setSelectedColor(color)}
                  title={color.label}
                  className={cn(
                    "relative w-9 h-9 rounded-full border-2 transition-all duration-200 focus:outline-none",
                    selectedColor?._key === color._key
                      ? "border-gray-900 scale-110 shadow-md"
                      : "border-gray-200 hover:border-gray-500 hover:scale-105"
                  )}
                  style={{ backgroundColor: color.hex ?? "#ccc" }}
                >
                  {selectedColor?._key === color._key && (
                    <Check
                      size={14}
                      className="absolute inset-0 m-auto"
                      style={{ color: isLight(color.hex) ? "#000" : "#fff" }}
                      strokeWidth={3}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size selector */}
        {hasSizes && (
          <div>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
              Size
              {selectedSize && (
                <span className="ml-2 text-shop-dark-red font-semibold normal-case tracking-normal">
                  — {SIZE_LABELS[selectedSize] ?? selectedSize}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  id={`merch-size-${sz}`}
                  onClick={() => setSelectedSize(sz)}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-semibold uppercase transition-all duration-200",
                    selectedSize === sz
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-900 hover:text-gray-900"
                  )}
                >
                  {SIZE_LABELS[sz] ?? sz}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart */}
        <div className="flex flex-col gap-3 mt-2">
          <button
            id="merch-add-to-cart"
            onClick={handleAddToCart}
            disabled={adding}
            className={cn(
              "flex items-center justify-center gap-2.5 w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300",
              adding
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-shop-dark-red hover:bg-red-800 text-white shadow-lg hover:shadow-shop-dark-red/30 hover:-translate-y-0.5 active:translate-y-0"
            )}
          >
            <ShoppingBag size={16} />
            {adding ? "Adding..." : "Add to Cart"}
          </button>

          <p className="text-center text-xs text-gray-400 font-body">
            This item is made-to-order and shipped directly to your door.
          </p>
        </div>

        {/* Shipping blurb */}
        <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3 bg-gray-50">
          <div className="flex items-center gap-3">
            <Truck size={16} className="text-shop-dark-red flex-shrink-0" />
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Ships in 3–7 business days</span>{" "}
              — printed and packaged on demand.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Zap size={16} className="text-shop-dark-red flex-shrink-0" />
            <p className="text-sm text-gray-600">
              <span className="font-semibold">100% branded experience</span>{" "}
              — you never leave our site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Determine if a hex color is light (for check icon contrast) */
function isLight(hex?: string): boolean {
  if (!hex) return true;
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export default MerchConfigurator;
