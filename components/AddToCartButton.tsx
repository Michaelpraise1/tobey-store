"use client";

import { cn } from '@/lib/utils';
import { Product } from '@/sanity.types';
import { ShoppingCart } from 'lucide-react';
import React from 'react';
import { useCartStore } from '@/store/store';
import toast from 'react-hot-toast';
import { useUser, useClerk } from '@clerk/nextjs';

const AddToCartButton = ({ 
  product,
  className 
}: {
  product: Product;
  className?: string;
}) => {
  const addItem = useCartStore((state) => state.addItem);
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

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

    addItem(product);
    toast.success(`${product?.title?.substring(0, 12)}... added to cart`);
  };

  return (
    <button 
      onClick={handleAddToCart}
      className={cn(
        "flex items-center justify-center gap-2 bg-black hover:bg-shop-dark-red text-white py-2 px-4 rounded-md transition-colors duration-300 w-full font-medium text-sm",
        className
      )}
    >
      <ShoppingCart size={16} />
      <span>{isSignedIn ? "Add to Cart" : "Sign in to Buy"}</span>
    </button>
  );
};

export default AddToCartButton;
