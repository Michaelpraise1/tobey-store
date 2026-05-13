"use client";

import { Heart } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/store/store';

const FavoriteButton = () => {
  const getFavoriteCount = useCartStore((state) => state.getFavoriteCount);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before mount: render a neutral shell that matches the server
  if (!mounted) {
    return (
      <div className='relative'>
        <Heart className='w-5 h-5 text-gray-400' />
      </div>
    );
  }

  const count = getFavoriteCount();

  return (
    <Link href="/favourites" className='group relative'>
      <Heart
        className={`w-5 h-5 hoverEffect transition-colors duration-300 ${
          count > 0 ? 'text-shop_light_red fill-shop_light_red' : 'hover:text-shop_light_red'
        }`}
      />
      {count > 0 && (
        <span className='absolute -top-1 -right-1 bg-shop-dark-red text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
};

export default FavoriteButton;