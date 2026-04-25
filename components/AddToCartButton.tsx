"use client";

import { cn } from '@/lib/utils';
import { Product } from '@/sanity.types';
import { ShoppingCart } from 'lucide-react';
import React from 'react';
import { useCartStore } from '@/store/store';
import toast from 'react-hot-toast';

const AddToCartButton = ({ 
  product,
  className 
}: {
  product: Product;
  className?: string;
}) => {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        addItem(product);
        toast.success(`${product?.title?.substring(0, 12)}... added to cart`);
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
