import { cn } from '@/lib/utils';
import { Product } from '@/sanity.types';
import { Heart } from 'lucide-react';
import React from 'react'

const AddToWishlistButton = ({ product,
  className,}:{
    product: Product;
    className?: string;
  }) => {
 
  return (
    <div className={cn("absolute top-2 right-2 z-10", className)}>
     <div className='p-2.5 rounded-full hover:bg-shop-dark-red hover:text-white bg-[#f1f3f8] hoverEffect cursor-pointer transition-colors duration-300'>
      <Heart size={15}/>
      </div>
    </div>
  )
}

export default AddToWishlistButton;