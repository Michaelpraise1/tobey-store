"use client";

import { cn } from '@/lib/utils';
import { Product } from '@/sanity.types';
import { Heart } from 'lucide-react';
import React from 'react';
import { useCartStore } from '@/store/store';
import toast from 'react-hot-toast';
import { useUser, useClerk } from '@clerk/nextjs';

const AddToWishlistButton = ({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) => {
  const toggleFavorite = useCartStore((state) => state.toggleFavorite);
  const isFavorite = useCartStore((state) => state.isFavorite);
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const favorited = isFavorite(product._id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      toast("Removed from favorites", {
        icon: "💔",
        style: { borderRadius: "8px", background: "#151515", color: "#fff" },
      });
    } else {
      toast.success("Added to favorites!", {
        icon: "❤️",
        style: { borderRadius: "8px", background: "#151515", color: "#fff" },
      });
    }
  };

  return (
    <div className={cn("absolute top-2 right-2 z-10", className)}>
      <button
        onClick={handleToggle}
        title={favorited ? "Remove from favorites" : "Add to favorites"}
        className={cn(
          "p-2.5 rounded-full hoverEffect cursor-pointer transition-all duration-300",
          favorited
            ? "bg-shop-dark-red text-white scale-110"
            : "bg-[#f1f3f8] hover:bg-shop-dark-red hover:text-white text-gray-500"
        )}
      >
        <Heart
          size={15}
          className={cn("transition-all duration-300", favorited && "fill-white")}
        />
      </button>
    </div>
  );
};

export default AddToWishlistButton;