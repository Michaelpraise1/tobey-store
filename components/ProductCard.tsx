"use client";

import { Product } from '@/sanity.types';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';
import React from 'react'
import AddToWishlistButton from './AddToWishlistButton';
import Link from 'next/link';
import { Flame, Cpu } from 'lucide-react';
import AddToCartButton from './AddToCartButton';
import { useCartStore } from '@/store/store';
import { useUser, useClerk } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const ProductCard = ({ product }: { product: Product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();

  const hasSizes = product.sizes && product.sizes.length > 0;

  const handleAiAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

    const savedAiSize = typeof window !== "undefined" ? localStorage.getItem("mortal-fang-ai-size") : null;

    if (!savedAiSize) {
      toast.error("No AI Sizing profile found! Redirecting to setup fit profile...", {
        icon: "🤖",
        style: {
          borderRadius: "8px",
          background: "#151515",
          color: "#fff",
          border: "1px solid #7f1d1d",
        },
      });
      router.push(`/product/${product?.slug?.current || ""}`);
      return;
    }

    addItem(product);
    toast.success(`${product?.title?.substring(0, 12)}... (AI Fit: ${savedAiSize}) added to cart!`, {
      icon: "🤖",
      style: {
        borderRadius: "8px",
        background: "#151515",
        color: "#fff",
        border: "1px solid #047857",
      },
    });
  };
  return (
    <div className="flex flex-col h-full">
      <div className="aspect-square w-full bg-gray-100 rounded-md flex items-center justify-center mb-4 overflow-hidden relative group">
        <Link href={product?.slug?.current ? `/product/${product.slug.current}` : "#"} className="absolute inset-0 z-10"></Link>
        {product?.images && product.images.length > 0 ? (
          <Image
            src={urlFor(product.images[0]).url()}
            loading="lazy"
            alt={product.title || "Product Image"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

          />
        ) : (
          <span className="text-gray-400">No Image provided</span>
        )}
        {product?.status === "available" && (
          <p className="absolute top-2 left-2 bg-shop-dark-red text-white text-sm  px-2 py-1 rounded-md group-hover:border-shop_light_red group-hover:text-shop-light-bg border-darkColor/50 hoverEffect">
            Sale!
          </p>
        )}
        {product?.status === "new" && (
          <p className="absolute top-2 left-2 bg-shop-dark-red text-white text-sm  px-2 py-1 rounded-md group-hover:border-shop_light_red group-hover:text-shop-light-bg border-darkColor/50 hoverEffect">
            New!
          </p>
        )}
        {product?.status === "out_of_stock" && (
          <p className="absolute top-2 left-2 bg-shop-dark-red text-white text-sm  px-2 py-1 rounded-md group-hover:border-shop_light_red group-hover:text-shop-light-bg border-darkColor/50 hoverEffect">
            Out of Stock
          </p>
        )}
        {product?.status === "hot" && <Link href={"/deal"}
          className="absolute top-2 left-2 bg-shop-dark-red text-white text-sm  px-2 py-1 rounded-md group-hover:border-shop_light_red group-hover:text-shop-light-bg border-darkColor/50 hoverEffect z-20"
        >
          <Flame
            size={18}
            fill="#fb6c08"
            className='text-shop-orange/50 group-hover:text-shop-orange hoverEffect ' />
        </Link>}
        <div className="z-20 absolute top-0.5 right-2">
          <AddToWishlistButton product={product} />
        </div>
      </div>

      <div className="flex flex-col flex-1 p-2">
        <Link href={product?.slug?.current ? `/product/${product.slug.current}` : "#"}>
          <h3 className="font-semibold text-lg line-clamp-1 hover:text-blue-600 transition-colors">{product.title || 'Unnamed Product'}</h3>
        </Link>
        {product?.categories && (
          <p className="text-sm text-gray-500">{product?.categories.map((cat: any) => cat.title || cat).join(", ")}</p>
        )}



        {product.description && (
          <div className="text-gray-600 text-sm mt-1 mb-2 line-clamp-2">
            {/* If description is block content, we just show a placeholder or handle it. Assuming it's complex, we skip it for plain text, or render title only for now. */}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between mb-3 text-gray-900">
          <span className="font-bold text-lg">${product.price != null ? product.price : '0.00'}</span>
          {product.discount && (
            <span className="text-sm text-gray-400 line-through">${product.discount}</span>
          )}
        </div>
        <AddToCartButton product={product} />
        {hasSizes && (
          <button
            onClick={handleAiAddToCart}
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white py-2 px-4 rounded-md transition-all duration-300 w-full font-black uppercase tracking-wider text-[10px] mt-2 shadow-sm cursor-pointer"
          >
            <Cpu size={12} className="animate-pulse" />
            <span>AI Shape Fit</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default ProductCard;