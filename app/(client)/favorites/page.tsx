"use client";

import React from "react";
import Container from "@/components/Container";
import { useCartStore } from "@/store/store";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart, ArrowLeft, Flame } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, SignInButton } from "@clerk/nextjs";

const FavouritesPage = () => {
  const favorites = useCartStore((state) => state.favorites);
  const removeFavorite = useCartStore((state) => state.removeFavorite);
  const { isSignedIn } = useUser();

  /* ── Not signed in ── */
  if (!isSignedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="relative">
          <Heart className="w-20 h-20 text-gray-200" />
          <span className="absolute inset-0 flex items-center justify-center text-3xl">🔐</span>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-widest text-gray-800 font-gaming">
          Sign In to View Favourites
        </h2>
        <p className="text-gray-500 text-sm max-w-sm">
          Your saved items are waiting. Sign in to see and manage your favourites.
        </p>
        <SignInButton mode="modal">
          <button className="bg-shop_light_red hover:bg-shop-dark-red text-white font-bold uppercase tracking-wider px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-105">
            Sign In
          </button>
        </SignInButton>
      </div>
    );
  }

  /* ── Empty state ── */
  if (!favorites.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="relative w-28 h-28 bg-gray-50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-200">
          <Heart className="w-12 h-12 text-gray-300" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-widest text-gray-800 font-gaming">
          No Favourites Yet
        </h2>
        <p className="text-gray-500 text-sm max-w-sm">
          Hit the ❤️ on any product to save it here for later.
        </p>
        <Link
          href="/shop"
          className="flex items-center gap-2 bg-shop_light_red hover:bg-shop-dark-red text-white font-bold uppercase tracking-wider px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-105"
        >
          <Flame className="w-4 h-4" />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <Container>
      <div className="py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/shop"
              className="flex items-center gap-1 text-gray-400 hover:text-shop_light_red text-sm mb-3 transition-colors duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              Continue Shopping
            </Link>
            <h1 className="font-gaming text-3xl md:text-4xl font-black uppercase tracking-widest text-gray-900">
              My{" "}
              <span className="text-shop_light_red drop-shadow-[0_0_10px_rgba(220,38,38,0.3)]">
                Favourites
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {favorites.length} {favorites.length === 1 ? "item" : "items"} saved
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-shop_light_red/10 border border-shop_light_red/30 rounded-full px-4 py-2">
            <Heart className="w-4 h-4 text-shop_light_red fill-shop_light_red" />
            <span className="text-shop_light_red font-bold text-sm">{favorites.length}</span>
          </div>
        </div>

        {/* Grid */}
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.25 }}
                className="group bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  <Link href={product?.slug?.current ? `/product/${product.slug.current}` : "#"} className="absolute inset-0 z-10" />
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={urlFor(product.images[0]).width(400).url()}
                      alt={product.title || "Product"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Flame className="w-12 h-12 text-gray-200" />
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => removeFavorite(product._id)}
                    title="Remove from favourites"
                    className="absolute top-2 right-2 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm border border-red-100 text-shop_light_red hover:bg-shop_light_red hover:text-white transition-all duration-200 hover:scale-110 shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>

                  {/* Status badge */}
                  {product.status === "new" && (
                    <span className="absolute top-2 left-2 z-20 bg-shop-dark-red text-white text-xs px-2 py-1 rounded-md font-semibold">
                      New
                    </span>
                  )}
                  {product.status === "hot" && (
                    <span className="absolute top-2 left-2 z-20 bg-shop-dark-red text-white text-xs px-2 py-1 rounded-md font-semibold flex items-center gap-1">
                      <Flame size={11} fill="#fb6c08" /> Hot
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1 gap-3">
                  <Link href={product?.slug?.current ? `/product/${product.slug.current}` : "#"}>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-shop_light_red transition-colors duration-200 leading-snug">
                      {product.title || "Unnamed Product"}
                    </h3>
                  </Link>

                  {product.categories && (
                    <p className="text-xs text-gray-400">
                      {product.categories.map((cat: any) => cat.title || cat).join(", ")}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-black text-lg text-gray-900">
                      ${product.price != null ? product.price : "0.00"}
                    </span>
                    {product.discount && (
                      <span className="text-xs text-gray-400 line-through">
                        ${product.discount}
                      </span>
                    )}
                  </div>

                  <AddToCartButton
                    product={product}
                    className="mt-1"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </Container>
  );
};

export default FavouritesPage;
