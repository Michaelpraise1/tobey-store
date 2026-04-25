"use client";

import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/store/store';

const Carticon = () => {
  const [isMounted, setIsMounted] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Link href={"/cart"} className='group relative'>
      <ShoppingBag className='w-5 h-5 hover:text-shop_light_red hoverEffect' />
      <span className='absolute -top-1 -right-1 bg-shop-dark-red text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
        {isMounted ? itemCount : 0}
      </span>
    </Link>
  )
}

export default Carticon;