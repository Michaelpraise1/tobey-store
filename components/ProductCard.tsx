import { Product } from '@/sanity.types';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';
import React from 'react'
import AddToWishlistButton from './AddToWishlistButton';
import Link from 'next/link';
import { Flame } from 'lucide-react';
import AddToCartButton from './AddToCartButton';

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="aspect-square w-full bg-gray-100 rounded-md flex items-center justify-center mb-4 overflow-hidden relative group">
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
          className="absolute top-2 left-2 bg-shop-dark-red text-white text-sm  px-2 py-1 rounded-md group-hover:border-shop_light_red group-hover:text-shop-light-bg border-darkColor/50 hoverEffect"
        >
          <Flame
            size={18}
            fill="#fb6c08"
            className='text-shop-orange/50 group-hover:text-shop-orange hoverEffect ' />
        </Link>}
        <AddToWishlistButton product={product} />
      </div>

      <div className="flex flex-col flex-1 p-2">
        <h3 className="font-semibold text-lg line-clamp-1">{product.title || 'Unnamed Product'}</h3>
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
      </div>
    </div>
  )
}

export default ProductCard;