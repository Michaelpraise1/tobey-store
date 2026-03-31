"use client"
import React, { useEffect, useState } from 'react'
import HomeTabBar from './HomeTabBar';
import { productType } from '@/constants/data';
import { client } from '@/sanity/lib/client';
import { Loader2 } from 'lucide-react';
import NoProductAvailable from './NoProductAvailable';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { Product } from '@/sanity.types';


const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectTab, setselectTab] = useState(productType[0]?.title || "");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = `*[_type == "product" && variants == $variant]`;
        const params = { variant: selectTab.toLowerCase() };
        const response = await client.fetch(query, params);
        setProducts(response);
      } catch (error) {
        console.log("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectTab]);

  return (
    <div>
      <HomeTabBar selectTab={selectTab} onTabselect={setselectTab} />
      {loading ? (
        <div className='flex flex-col items-center justify-center py-10 min-h-80 gap-4 bg-gray-100 w-full mt-10'>
          <div className='space-x-2 flex items-center text-blue-600'>
            <Loader2 className='w-5 h-6 animate-spin' />
            <span>Product is loading...</span>
          </div>
        </div>
      ) : products?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10 px-4">
          <AnimatePresence>
            {products.map((product) => (
              <motion.div
              layout 
                key={product._id || Math.random()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <NoProductAvailable selectTab={selectTab} />
      )}
    </div>
  )
}

export default ProductGrid;