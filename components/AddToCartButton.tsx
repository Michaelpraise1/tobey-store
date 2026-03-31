"use client";

import { cn } from '@/lib/utils';
import { Product } from '@/sanity.types';
import { ShoppingCart } from 'lucide-react';
import React from 'react';

const AddToCartButton = ({ 
  product,
  className 
}: {
  product: Product;
  className?: string;
}) => {
  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        // Add to cart logic will go here
      }}
      className={cn(
        "flex items-center justify-center gap-2 bg-black hover:bg-shop-dark-red text-white py-2 px-4 rounded-md transition-colors duration-300 w-full font-medium text-sm",
        className
      )}
    >
      <ShoppingCart size={16} />
      <span>Add to Cart</span>
    </button>
  );
};

export default AddToCartButton;
