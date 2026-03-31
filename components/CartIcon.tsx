import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

const Carticon = () => {
  return (
    <Link href={"/cart"} className='group relative'>
      <ShoppingBag className='w-5 h-5 hover:text-shop_light_red hoverEffect' />
      <span className='absolute -top-1 -right-1 bg-shop-dark-red text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>0</span>
    </Link>
  )
}

export default Carticon;