"use client";

import { useCartStore } from '@/store/store';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Container from '@/components/Container';

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { items, incrementQuantity, decrementQuantity, removeItem, getTotalPrice, getItemCount } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Container className="py-10 min-h-[50vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-20 min-h-[50vh] flex flex-col items-center justify-center text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <Trash2 size={40} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Browse our products and find your next favorite gear.</p>
        <Link 
          href="/"
          className="bg-black hover:bg-shop-dark-red text-white py-3 px-8 rounded-md transition-colors duration-300 font-medium"
        >
          Start Shopping
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold mb-8 text-darkColor">Shopping Cart</h1>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 gap-y-8">
        {/* Cart Items */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-5 p-4 border-b border-gray-100 bg-gray-50 text-sm font-semibold text-gray-700">
              <div className="sm:col-span-2">Product</div>
              <div>Price</div>
              <div>Quantity</div>
              <div className="text-right">Total</div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {items.map((item) => {
                const product = item.product;
                const price = product.price || 0;
                
                return (
                  <div key={product._id} className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-5 items-center gap-4">
                    {/* Product Info */}
                    <div className="sm:col-span-2 flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={urlFor(product.images[0]).url()}
                            alt={product.title || 'Product'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${product?.slug?.current || '#'}`} className="text-base font-semibold text-gray-900 hover:text-shop-dark-red line-clamp-2 mb-1">
                          {product.title}
                        </Link>
                        {product.categories && (
                          <p className="text-sm text-gray-500 line-clamp-1">{product.categories.map((c: any) => c.title || c).join(', ')}</p>
                        )}
                        <button 
                          onClick={() => removeItem(product._id)}
                          className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 mt-2 sm:hidden font-medium"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="hidden sm:flex text-gray-900 font-medium">
                      ${price.toFixed(2)}
                    </div>
                    
                    {/* Quantity */}
                    <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start">
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button 
                          onClick={() => decrementQuantity(product._id)}
                          className="px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => incrementQuantity(product._id)}
                          className="px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(product._id)}
                        className="hidden sm:flex p-2 text-gray-400 hover:text-red-500 transition-colors ml-4"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    {/* Total */}
                    <div className="w-full sm:w-auto flex justify-between sm:justify-end font-bold text-gray-900 sm:text-right mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                      <span className="sm:hidden text-gray-500 font-normal">Subtotal</span>
                      <span>${(price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-6 sticky top-8">
            <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({getItemCount()} items)</span>
                <span className="font-medium text-gray-900">${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
            
            <Link 
              href="/checkout"
              className="w-full flex items-center justify-center bg-black hover:bg-shop-dark-red text-white py-3 px-4 rounded-md transition-colors duration-300 font-medium"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
